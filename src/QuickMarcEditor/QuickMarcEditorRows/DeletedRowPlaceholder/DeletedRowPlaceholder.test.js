import React from 'react';
import {
  fireEvent,
  render,
} from '@testing-library/react';

import { runAxeTest } from '@folio/stripes-testing';

import { DeletedRowPlaceholder } from './DeletedRowPlaceholder';

const field = {
  tag: '010',
};

const mockRestoreRow = jest.fn();

const renderComponent = (props = {}) => render((
  <DeletedRowPlaceholder
    field={field}
    restoreRow={mockRestoreRow}
    {...props}
  />
));

describe('Given DeletedRowPlaceholder', () => {
  it('should render with no axe errors', async () => {
    const { container } = renderComponent();

    await runAxeTest({
      rootNode: container,
    });
  });

  it('should render correct placeholder message', async () => {
    const { getByText } = renderComponent();

    expect(getByText('ui-quick-marc.record.fieldDeleted'));
  });

  describe('when clicking on Undo', () => {
    it('should call restoreRow prop', () => {
      const { getByText } = renderComponent();

      fireEvent.click(getByText('ui-quick-marc.record.fieldDeleted.undo'));

      expect(mockRestoreRow).toHaveBeenCalled();
    });
  });
});
