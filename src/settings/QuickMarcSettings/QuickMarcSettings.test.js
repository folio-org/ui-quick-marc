import { render } from '@folio/jest-config-stripes/testing-library/react';
import { Settings } from '@folio/stripes/smart-components';

import { QuickMarcSettings } from './QuickMarcSettings';
import Harness from '../../../test/jest/helpers/harness';

const renderQuickMarcSettings = () => render(
  <Harness>
    <QuickMarcSettings />
  </Harness>,
);

describe('Given Settings', () => {
  beforeEach(() => {
    Settings.mockClear();
  });

  it('should be rendered', () => {
    const { getByText } = renderQuickMarcSettings();

    expect(getByText('Settings')).toBeVisible();
  });
});
