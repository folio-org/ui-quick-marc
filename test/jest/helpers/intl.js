import { IntlProvider } from 'react-intl';

import quickMarcTranslations from '../../../translations/ui-quick-marc/en';

const prefixKeys = (translations, prefix) => {
  return Object
    .keys(translations)
    .reduce((acc, key) => (
      {
        ...acc,
        [`${prefix}.${key}`]: translations[key],
      }
    ), {});
};

const translations = {
  ...prefixKeys(quickMarcTranslations, 'ui-quick-marc'),
};

const Intl = ({ children }) => (
  <IntlProvider
    locale="en"
    messages={translations}
  >
    {children}
  </IntlProvider>
);

export default Intl;
