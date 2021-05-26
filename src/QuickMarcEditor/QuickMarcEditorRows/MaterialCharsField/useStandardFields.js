import { useIntl } from 'react-intl';

import { SUBFIELD_TYPES } from '../BytesField';

const CATEGORY_VALUES = ['', 'a', 'c', 'd', 'e', 'f', 'g', 'i', 'j', 'k', 'm', 'o', 'p', 'r', 's', 't'];

export default function useStandardFields() {
  const intl = useIntl();

  const getLabel = (category) => (category
    ? `${category} - ${intl.formatMessage({ id: `ui-quick-marc.record.materialChars.materialType.${category}` })}`
    : '');

  return [{
    name: 'Type',
    type: SUBFIELD_TYPES.SELECT,
    options: CATEGORY_VALUES.map(category => ({ label: getLabel(category), value: category })),
  }];
}
