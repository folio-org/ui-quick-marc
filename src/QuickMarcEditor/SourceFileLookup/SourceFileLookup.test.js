import {
  render,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import { SourceFileLookup } from './SourceFileLookup';
import { useAuthoritySourceFiles } from '../../queries';
import Harness from '../../../test/jest/helpers/harness';

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

  it('should only fetch selectable source files', () => {
    renderSourceFileLookup();

    expect(useAuthoritySourceFiles).toHaveBeenCalledWith({ searchParams: { selectable: true } });
  });

  describe('when selecting a source file', () => {
    it('should call onSourceFileSelect callback with correct source file', async () => {
      const {
        getByRole,
      } = renderSourceFileLookup();

      const select = getByRole('combobox', { name: 'ui-quick-marc.sourceFileLookup.fieldLabel' });

      fireEvent.change(select, { target: { value: sourceFiles[0].id } });

      expect(mockOnSourceFileSelect).toHaveBeenCalledWith(sourceFiles[0]);
    });
  });

  describe('when no value is selected', () => {
    it('should have empty default value selected', () => {
      const { getByRole } = renderSourceFileLookup();

      const select = getByRole('combobox', { name: 'ui-quick-marc.sourceFileLookup.fieldLabel' });

      expect(select.value).toBe('');
    });
  });
});
