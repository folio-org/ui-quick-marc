import {
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import { useIntl } from 'react-intl';

import { TitleManager } from '@folio/stripes/core';
import {
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';
import { Settings } from '@folio/stripes/smart-components';

import { ValidationRulesSettings } from '../ValidationRulesSettings';

const QuickMarcSettings = () => {
  const match = useRouteMatch();
  const location = useLocation();
  const { formatMessage } = useIntl();

  const pages = [{
    route: 'validation-rules',
    label: formatMessage({ id: 'ui-quick-marc.settings.marcValidationRules.pane.title' }),
    component: ValidationRulesSettings,
    perm: undefined,
  }];

  return (
    <CommandList commands={defaultKeyboardShortcuts}>
      <TitleManager page={formatMessage({ id: 'ui-quick-marc.settings.html.page.title' })}>
        <Settings
          match={match}
          location={location}
          paneTitle={formatMessage({ id: 'ui-quick-marc.settings.heading' })}
          pages={pages}
        />
      </TitleManager>
    </CommandList>
  );
};

export { QuickMarcSettings };
