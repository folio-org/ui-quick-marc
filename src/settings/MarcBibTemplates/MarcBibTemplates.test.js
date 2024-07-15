import { render } from '@folio/jest-config-stripes/testing-library/react';

import { MarcBibTemplates } from './MarcBibTemplates';
import Harness from '../../../test/jest/helpers/harness';

const renderMarcBibTemplates = () => render(
  <Harness>
    <MarcBibTemplates />
  </Harness>,
);

describe('Given MarcBibTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pane title', () => {
    const { getByText } = renderMarcBibTemplates();

    expect(getByText('ui-quick-marc.settings.marcBibTemplates.pane.title')).toBeVisible();
  });
});
