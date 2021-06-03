import { useIntl } from 'react-intl';

import { SUBFIELD_TYPES } from './BytesField';

export default function useSelectField({ name, codes, key }) {
  const intl = useIntl();

  const getLabel = (code) => {
    if (!code) {
      return '';
    }

    const label = intl.formatMessage({ id: `${key}.${code}` });

    return `${code} - ${label}`;
  };

  return {
    name,
    type: SUBFIELD_TYPES.SELECT,
    options: codes.map(code => ({ label: getLabel(code), value: code })),
  };
}
