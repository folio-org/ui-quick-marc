import React from 'react';

import { MARC_TYPES } from '../../../common/constants';
import { LEADER_TAG } from '../../constants';
import {
  SUBFIELD_TYPES,
} from '../BytesField';

import HoldingsFixedField from './HoldingsFixedField';
import AuthorityFixedField from './AuthorityFixedField';
import BibliographicFixedField from './BibliographicFixedField';

export const FixedFieldFactory = {
  getFixedFieldByType(marcType) {
    let FixedField;

    switch (marcType) {
      case MARC_TYPES.HOLDINGS:
        FixedField = HoldingsFixedField;
        break;
      case MARC_TYPES.AUTHORITY:
        FixedField = AuthorityFixedField;
        break;
      case MARC_TYPES.BIB:
        FixedField = BibliographicFixedField;
        break;
      default:
        FixedField = null;
    }

    return FixedField;
  },

  getFixedFieldType(fixedFieldSpec, type, subtype) {
    if (!fixedFieldSpec?.spec) {
      return undefined;
    }

    const checkTypeSubType = (fieldIdentifier) => {
      const hasTypePos = fieldIdentifier.positions['6'] || false;
      const hasSubTypePos = fieldIdentifier.positions['7'] || false;
      const typeOK = hasTypePos && fieldIdentifier.positions['6'].includes(type);
      const subTypeOK = hasSubTypePos ? hasSubTypePos && fieldIdentifier.positions['7'].includes(subtype) : true;

      return (typeOK && subTypeOK);
    };

    const fixedFieldType = fixedFieldSpec.spec.types.find((fixedFieldTypeFind) => {
      return fixedFieldTypeFind.identifiedBy.or.some((fieldIdentifier) => {
        return fieldIdentifier.tag === LEADER_TAG && checkTypeSubType(fieldIdentifier);
      });
    });

    return fixedFieldType;
  },

  getConfigFixedField(fixedFieldSpec, type, subtype = '') {
    const fixedFieldType = this.getFixedFieldType(fixedFieldSpec, type, subtype);
    const config = {
      fields: [],
      type: fixedFieldType?.code || undefined,
    };

    if (!fixedFieldType) {
      return config;
    }

    config.fields = fixedFieldType.items.filter(x => !x.readOnly).map((item) => {
      if (item.isArray) {
        return {
          name: item.code,
          hint: item.name,
          type: SUBFIELD_TYPES.BYTES,
          bytes: item.length,
          position: item.position,
        };
      }

      if (!item.isArray && item.length > 1) {
        return {
          name: item.code,
          hint: item.name,
          type: SUBFIELD_TYPES.STRING,
          length: item.length,
          position: item.position,
        };
      }

      return {
        name: item.code,
        hint: item.name,
        type: SUBFIELD_TYPES.BYTE,
        position: item.position,
      };
    });

    return config;
  },

  getFixedField(name, marcType, fixedFieldSpec, type, subtype) {
    const FixedField = this.getFixedFieldByType(marcType);
    const configFixedField = this.getConfigFixedField(fixedFieldSpec, type, subtype);

    return FixedField ? <FixedField name={name} config={configFixedField} /> : null;
  },
};
