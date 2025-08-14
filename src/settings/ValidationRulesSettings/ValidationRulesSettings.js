import { useIntl } from 'react-intl';

import { TitleManager } from '@folio/stripes/core';

export const ValidationRulesSettings = () => {
  const intl = useIntl();

  return (
    <TitleManager record={intl.formatMessage({ id: 'ui-quick-marc.settings.marcValidationRules.pane.title' })}>
      <div>MARC Validation Rules</div>
    </TitleManager>
  );
};
