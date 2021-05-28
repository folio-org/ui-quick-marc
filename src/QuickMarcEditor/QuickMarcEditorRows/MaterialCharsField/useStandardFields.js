import { useIntl } from 'react-intl';

import { SUBFIELD_TYPES } from '../BytesField';

const TYPE_VALUES = ['', 'a', 'c', 'd', 'e', 'f', 'g', 'i', 'j', 'k', 'm', 'o', 'p', 'r', 's', 't'];

export default function useStandardFields() {
  const intl = useIntl();

  const getLabel = (type) => {
    if (!type) {
      return '';
    }

    const typeValue = intl.formatMessage({ id: `ui-quick-marc.record.materialChars.materialType.${type}` });

    return `${type} - ${typeValue}`;
  };

  return [{
    name: 'Type',
    type: SUBFIELD_TYPES.SELECT,
    options: TYPE_VALUES.map(type => ({ label: getLabel(type), value: type })),
  }];
}
