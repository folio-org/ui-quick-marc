import React from 'react';

import { LEADER_TAG } from '../../constants';
import {
  SUBFIELD_TYPES,
} from '../BytesField';

import FixedField from './FixedField';

export const FixedFieldFactory = {

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

  getConfigFixedField(fixedFieldSpec, type, subtype = '', content = {}) {
    const fixedFieldType = this.getFixedFieldType(fixedFieldSpec, type, subtype);
    const config = {
      fields: [],
      type: fixedFieldType?.code || undefined,
    };

    if (!fixedFieldType) {
      return config;
    }

    config.fields = fixedFieldType.items.filter(x => !x.readOnly).map((item) => {
      // Temporary fix API for type mapa and field Proj
      if (item.code === 'Proj') {
        item.isArray = false;
      }

      const value = content[item.code] || '';

      const itemSelect = (item.allowedValues)
        ? {
          type: item.isArray ? SUBFIELD_TYPES.SELECTS : SUBFIELD_TYPES.SELECT,
          allowedValues: item.allowedValues,
          value,
        }
        : {};

      if (item.isArray) {
        return {
          name: item.code,
          hint: item.name,
          type: SUBFIELD_TYPES.BYTES,
          bytes: item.length,
          position: item.position,
          ...itemSelect,
        };
      }

      if (!item.isArray && item.length > 1) {
        return {
          name: item.code,
          hint: item.name,
          type: SUBFIELD_TYPES.STRING,
          length: item.length,
          position: item.position,
          ...itemSelect,
        };
      }

      return {
        name: item.code,
        hint: item.name,
        type: SUBFIELD_TYPES.BYTE,
        position: item.position,
        ...itemSelect,
      };
    });

    return config;
  },

  getConfigWithOptions(intl, configFixedField) {
    const getOptionLabel = (allowedValue) => {
      const key = 'ui-quick-marc.record.fixedField';
      const label = intl.formatMessage({ id: `${key}.${allowedValue.name}` });

      return `${allowedValue.code} - ${label}`;
    };

    const fields = configFixedField.fields.map(field => {
      if ((field.type === SUBFIELD_TYPES.SELECTS) || (field.type === SUBFIELD_TYPES.SELECT)) {
        return {
          ...field,
          options: (field?.allowedValues || []).map(allowedValue => {
            return {
              value: allowedValue.code,
              label: getOptionLabel(allowedValue),
            };
          }),
        };
      }

      return field;
    });

    return {
      ...configFixedField,
      fields,
    };
  },

  getFixedField(intl, name, fixedFieldSpec, type, subtype, content) {
    const configFixedField = this.getConfigFixedField(fixedFieldSpec, type, subtype, content);
    const config = this.getConfigWithOptions(intl, configFixedField);

    return <FixedField name={name} config={config} />;
  },
};
