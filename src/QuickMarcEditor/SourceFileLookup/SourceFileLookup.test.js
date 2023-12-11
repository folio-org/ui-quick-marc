import {
  render,
  fireEvent,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import { SourceFileLookup } from './SourceFileLookup';
import { useAuthoritySourceFiles } from '../../queries';
import Harness from '../../../test/jest/helpers/harness';

jest.mock('./SourceFileLookupModal', () => ({
  SourceFileLookupModal: ({ onConfirm }) => (
    <>
      SourceFileLookupModal
      <button type="button" onClick={() => onConfirm('source-file-id')}>Confirm</button>
    </>
  ),
}));

jest.mock('../../queries', () => ({
  ...jest.requireActual('../../queries'),
  useAuthoritySourceFiles: jest.fn(),
}));

const mockOnSourceFileSelect = jest.fn();

const renderSourceFileLookup = (props = {}) => render(
  <SourceFileLookup
    onSourceFileSelect={mockOnSourceFileSelect}
    {...props}
  />,
  { wrapper: Harness },
);

const sourceFiles = [{
  id: 'source-file-id',
  name: 'Test source file',
}];

describe('Given SourceFileLookup', () => {
  beforeAll(() => {
    useAuthoritySourceFiles.mockReturnValue({
      sourceFiles,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal trigger button', async () => {
    const {
      getByRole,
      getByText,
    } = renderSourceFileLookup();

    fireEvent.click(getByRole('button', { name: 'ui-quick-marc.sourceFileLookup' }));

    await waitFor(() => expect(getByText('SourceFileLookupModal')).toBeDefined());
  });

  describe('when confirming source file selection in modal', () => {
    it('should call onSourceFileSelect callback with correct source file', async () => {
      const {
        getByRole,
        getByText,
      } = renderSourceFileLookup();

      fireEvent.click(getByRole('button', { name: 'ui-quick-marc.sourceFileLookup' }));
      fireEvent.click(getByText('Confirm'));

      expect(mockOnSourceFileSelect).toHaveBeenCalledWith(sourceFiles[0]);
    });
  });
});
