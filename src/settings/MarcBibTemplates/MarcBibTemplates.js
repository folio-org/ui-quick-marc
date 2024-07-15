import { useIntl } from 'react-intl';

import { TitleManager } from '@folio/stripes/core';
import { Pane } from '@folio/stripes/components';

const MarcBibTemplates = () => {
  const intl = useIntl();

  const paneTitle = intl.formatMessage({ id: 'ui-quick-marc.settings.marcBibTemplates.pane.title' });

  return (
    <TitleManager record={paneTitle}>
      <Pane
        defaultWidth="100%"
        paneTitle={paneTitle}
        id="settings-marc-bib-templates-pane"
      />
    </TitleManager>
  );
};

export { MarcBibTemplates };
