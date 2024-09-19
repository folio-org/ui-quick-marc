import {
  render,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import { SourceFileLookupModal } from './SourceFileLookupModal';

const sourceFileOptions = [{
  label: 'Source File A',
  value: 'sfa',
}, {
  label: 'Source File B',
  value: 'sfb',
}];

const mockOnConfirm = jest.fn();
const mockOnCancel = jest.fn();

const renderSourceFileLookupModal = (props = {}) => render(
  <SourceFileLookupModal
    open
    sourceFileOptions={sourceFileOptions}
    onConfirm={mockOnConfirm}
    onCancel={mockOnCancel}
    {...props}
  />,
);

describe('Given SourceFileLookupModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal', () => {
    const { getByText } = renderSourceFileLookupModal();

    expect(getByText('ui-quick-marc.sourceFileLookupModal')).toBeDefined();
  });

  describe('when no value is selected', () => {
    it('should have empty default value selected', () => {
      const { getByLabelText } = renderSourceFileLookupModal();

      const select = getByLabelText('ui-quick-marc.sourceFileLookupModal.fieldLabel');

      expect(select.value).toEqual('');
    });

    it('should disable Save & close button', () => {
      const { getByRole } = renderSourceFileLookupModal();

      const button = getByRole('button', { name: 'stripes-components.saveAndClose', hidden: true });

      expect(button).toBeDisabled();
    });
  });

  describe('when some source file value is selected', () => {
    it('should enable Save & close button', async () => {
      const {
        getByLabelText,
        getByText,
      } = renderSourceFileLookupModal();

      const select = getByLabelText('ui-quick-marc.sourceFileLookupModal.fieldLabel');

      fireEvent.change(select, { target: { value: sourceFileOptions[0].value } });

      const button = getByText('stripes-components.saveAndClose').closest('button');

      expect(button).toBeEnabled();
    });
  });

  describe('when confirming Source File selection', () => {
    it('should call onConfirm with correct source file id', async () => {
      const {
        getByLabelText,
        getByText,
      } = renderSourceFileLookupModal();

      const select = getByLabelText('ui-quick-marc.sourceFileLookupModal.fieldLabel');

      fireEvent.change(select, { target: { value: sourceFileOptions[0].value } });

      const button = getByText('stripes-components.saveAndClose').closest('button');

      fireEvent.click(button);

      expect(mockOnConfirm).toHaveBeenCalledWith(sourceFileOptions[0].value);
    });
  });

  describe('when closing the modal', () => {
    it('should call onCancel', async () => {
      const { getByText } = renderSourceFileLookupModal();

      const button = getByText('stripes-components.cancel').closest('button');

      fireEvent.click(button);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
