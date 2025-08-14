import {
  render,
  act,
} from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { SourceFileSelect } from '../../SourceFileSelect';
import { ControlNumberField } from './ControlNumberField';
import { useAuthorityFileNextHrid } from '../../../queries';
import Harness from '../../../../test/jest/helpers/harness';

jest.mock('../../SourceFileSelect', () => ({
  SourceFileSelect: jest.fn(() => <div>SourceFileSelect</div>),
}));

const hrid = 'n1';
const mockGetAuthorityFileNextHrid = jest.fn().mockResolvedValue({ hrid });
const record001 = {
  tag: '001',
};
const recordRows = [
  record001,
];

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: ({ 'data-testid': dataTestId }) => <div data-testid={dataTestId}>Loading</div>,
}));

jest.mock('../../../queries', () => ({
  ...jest.requireActual('../../../queries'),
  useAuthorityFileNextHrid: jest.fn().mockReturnValue({
    getAuthorityFileNextHrid: jest.fn().mockResolvedValue({ hrid }),
    isLoading: false,
  }),
}));

const getControlNumberField = (props = {}, formProps = {}) => (
  <Form
    onSubmit={jest.fn()}
    mutators={{ ...arrayMutators }}
    initialValues={{
      controlNumber: 'n 50000331',
      records: recordRows,
    }}
    {...formProps}
    render={({ values }) => (
      <ControlNumberField
        id="id-1"
        name="controlNumber"
        recordRows={values.records}
        canSelectSourceFile
        {...props}
      />
    )}
  />
);

const renderControlNumberField = (props, formProps) => render(
  getControlNumberField(props, formProps),
  { wrapper: Harness },
);

describe('Given ControlNumberField', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuthorityFileNextHrid.mockReturnValue({
      getAuthorityFileNextHrid: mockGetAuthorityFileNextHrid,
      isLoading: false,
    });
  });

  it('should render content field', () => {
    const {
      getByRole,
      getByText,
    } = renderControlNumberField();

    expect(getByRole('textbox')).toBeDefined();
    expect(getByText('SourceFileSelect')).toBeDefined();
  });

  describe('when marc type is not AUTHORITY or action is not CREATE', () => {
    it('should not render source file select', () => {
      const { queryByText } = renderControlNumberField({
        canSelectSourceFile: false,
      });

      expect(queryByText('SourceFileSelect')).toBeNull();
    });
  });

  describe('when action is CREATE an authority record', () => {
    describe('and a local source file is selected', () => {
      it('should have row content equal to the next HRID', async () => {
        const { getByText, getByRole } = renderControlNumberField({
          canSelectSourceFile: true,
        });

        const sourceFile = {
          id: 'source-file-id',
          source: 'local',
        };

        expect(getByText('SourceFileSelect')).toBeVisible();

        await act(async () => SourceFileSelect.mock.calls[0][0].onSourceFileSelect(sourceFile));

        expect(mockGetAuthorityFileNextHrid).toHaveBeenCalledWith(sourceFile.id);
        expect(getByRole('textbox', { name: 'ui-quick-marc.record.subfield' }).value).toBe(hrid);
      });
    });

    describe('and FOLIO source file is selected', () => {
      it('should have row content equal to 010 $a', async () => {
        const props = {
          canSelectSourceFile: true,
        };

        const formProps = {
          initialValues: {
            records: [
              record001,
              {
                id: 'fd2341be-b34f-4f4b-ad69-872ea4b62142',
                tag: '010',
                content: '$a some content $b test',
              },
            ],
          },
        };

        const { rerender, getByRole } = renderControlNumberField(props, formProps);

        const sourceFile = {
          id: 'source-file-id',
          source: 'folio',
        };

        await act(async () => SourceFileSelect.mock.calls[0][0].onSourceFileSelect(sourceFile));

        expect(getByRole('textbox', { name: 'ui-quick-marc.record.subfield' }).value).toBe('some content');

        const newFormProps = {
          initialValues: {
            records: [
              {
                id: 'fd2341be-b34f-4f4b-ad69-872ea4b62142',
                tag: '010',
                content: '$a some content2 $b test',
              },
            ],
          },
        };

        rerender(getControlNumberField(props, newFormProps));

        expect(getByRole('textbox', { name: 'ui-quick-marc.record.subfield' }).value).toBe('some content2');
      });
    });

    describe('and FOLIO source file is selected and the next HRID is loading', () => {
      it('should display loading next to the source file select', async () => {
        useAuthorityFileNextHrid.mockReturnValue({
          isLoading: true,
        });

        const { getByTestId, queryByText } = renderControlNumberField({
          canSelectSourceFile: true,
        });

        expect(queryByText('SourceFileSelect')).toBeVisible();
        expect(getByTestId('hridLoading')).toBeVisible();
      });
    });
  });
});
