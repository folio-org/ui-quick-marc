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

  getDocumentType(marcSpec, type, subtype) {
    let idx = -1;

    if (!marcSpec?.spec) {
      return undefined;
    }

    const checkTypeSubType = (orElement) => {
      const hasTypePos = orElement.positions['6'] || false;
      const hasSubTypePos = orElement.positions['7'] || false;
      const typeOK = hasTypePos && orElement.positions['6'].includes(type);
      const subTypeOK = hasSubTypePos ? hasSubTypePos && orElement.positions['7'].includes(subtype) : true;

      return (typeOK && subTypeOK);
    };

    marcSpec.spec.types.forEach((marcType, indexType) => {
      marcType.identifiedBy.or.forEach(orElement => {
        if (orElement.tag === LEADER_TAG) {
          if (checkTypeSubType(orElement)) {
            idx = indexType;
          }
        }
      });
    });

    return idx !== -1 ? marcSpec.spec.types[idx] : undefined;
  },

  getConfigFixedField(marcSpec, type, subtype = '') {
    const documentType = this.getDocumentType(marcSpec, type, subtype);
    const config = {
      fields: [],
      type: documentType?.code || undefined,
    };

    if (!documentType) {
      return config;
    }

    config.fields = documentType.items.filter(x => !x.readOnly).map((item) => {
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

  getFixedField(name, marcType, marcSpec, type, subtype) {
    const FixedField = this.getFixedFieldByType(marcType);
    const configFixedField = this.getConfigFixedField(marcSpec, type, subtype);

    return FixedField ? <FixedField name={name} config={configFixedField} /> : null;
  },
};
