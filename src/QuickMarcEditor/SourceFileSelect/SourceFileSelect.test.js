import {
  render,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import { SourceFileSelect } from './SourceFileSelect';
import { useAuthoritySourceFiles } from '../../queries';
import Harness from '../../../test/jest/helpers/harness';

jest.mock('../../queries', () => ({
  ...jest.requireActual('../../queries'),
  useAuthoritySourceFiles: jest.fn(),
}));

const mockOnSourceFileSelect = jest.fn();

const renderSourceFileSelect = (props = {}) => render(
  <SourceFileSelect
    onSourceFileSelect={mockOnSourceFileSelect}
    {...props}
  />,
  { wrapper: Harness },
);

const sourceFiles = [{
  id: 'source-file-id',
  name: 'Test source file',
}];

describe('Given SourceFileSelect', () => {
  beforeAll(() => {
    useAuthoritySourceFiles.mockReturnValue({
      sourceFiles,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should only fetch selectable source files', () => {
    renderSourceFileSelect();

    expect(useAuthoritySourceFiles).toHaveBeenCalledWith({ searchParams: { selectable: true } });
  });

  describe('when selecting a source file', () => {
    it('should call onSourceFileSelect callback with correct source file', async () => {
      const {
        getByRole,
      } = renderSourceFileSelect();

      const select = getByRole('combobox', { name: 'ui-quick-marc.sourceFileSelect.fieldLabel' });

      fireEvent.change(select, { target: { value: sourceFiles[0].id } });

      expect(mockOnSourceFileSelect).toHaveBeenCalledWith(sourceFiles[0]);
    });
  });

  describe('when no value is selected', () => {
    it('should have empty default value selected', () => {
      const { getByRole } = renderSourceFileSelect();

      const select = getByRole('combobox', { name: 'ui-quick-marc.sourceFileSelect.fieldLabel' });

      expect(select.value).toBe('');
    });
  });
});
