import React from 'react';
import { render } from '@testing-library/react';

import { runAxeTest } from '@folio/stripes-testing';

import PrintPopup from './PrintPopup';

jest.mock('../MarcContent', () => jest.fn().mockReturnValue('MarcContent'));

const renderPrintPopup = (props = {}) => render(
  <PrintPopup
    marc={{}}
    paneTitle="fakePaneTitle"
    marcTitle={<>fakeMarkTitle</>}
    onAfterPrint={jest.fn()}
    {...props}
  />,
);

describe('Given PrintPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with no axe errors', async () => {
    const { container } = renderPrintPopup();

    await runAxeTest({
      rootNode: container,
    });
  });

  it('should show the pane title', () => {
    const { getByText } = renderPrintPopup();

    expect(getByText('fakePaneTitle')).toBeVisible();
  });

  it('should display the content of the marc record', () => {
    const { getByText } = renderPrintPopup();

    expect(getByText('MarcContent')).toBeVisible();
  });
});
