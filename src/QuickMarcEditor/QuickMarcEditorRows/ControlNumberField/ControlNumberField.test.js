import {
  render,
  act,
} from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { SourceFileLookup } from '../../SourceFileLookup';
import { ControlNumberField } from './ControlNumberField';
import { useAuthorityFileNextHrid } from '../../../queries';
import { MARC_TYPES } from '../../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../constants';
import Harness from '../../../../test/jest/helpers/harness';

jest.mock('../../SourceFileLookup', () => ({
  SourceFileLookup: jest.fn(() => <div>SourceFileLookup</div>),
}));

const hrid = 'n1';
const mockGetAuthorityFileNextHrid = jest.fn().mockResolvedValue({ hrid });

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
      records: [],
    }}
    {...formProps}
    render={({ values }) => (
      <ControlNumberField
        id="id-1"
        name="controlNumber"
        marcType={MARC_TYPES.AUTHORITY}
        action={QUICK_MARC_ACTIONS.CREATE}
        recordRows={values.records}
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
    expect(getByText('SourceFileLookup')).toBeDefined();
  });

  describe('when marc type is not AUTHORITY', () => {
    it('should not render source file lookup', () => {
      const { queryByText } = renderControlNumberField({
        marcType: MARC_TYPES.BIB,
      });

      expect(queryByText('SourceFileLookup')).toBeNull();
    });
  });

  describe('when action is not CREATE', () => {
    it('should not render source file lookup', () => {
      const { queryByText } = renderControlNumberField({
        action: QUICK_MARC_ACTIONS.EDIT,
      });

      expect(queryByText('ui-quick-marc.sourceFileLookup')).toBeNull();
    });
  });

  describe('when action is CREATE an authority record', () => {
    describe('and a local source file is selected', () => {
      it('should have row content equal to the next HRID', async () => {
        const { getByText, getByRole } = renderControlNumberField({
          action: QUICK_MARC_ACTIONS.CREATE,
          marcType: MARC_TYPES.AUTHORITY,
        });

        const sourceFile = {
          id: 'source-file-id',
          source: 'local',
        };

        expect(getByText('SourceFileLookup')).toBeVisible();

        await act(async () => SourceFileLookup.mock.calls[0][0].onSourceFileSelect(sourceFile));

        expect(mockGetAuthorityFileNextHrid).toHaveBeenCalledWith(sourceFile.id);
        expect(getByRole('textbox', { name: 'ui-quick-marc.record.subfield' }).value).toBe(hrid);
      });
    });

    describe('and FOLIO source file is selected', () => {
      it('should have row content equal to 010 $a', async () => {
        const props = {
          action: QUICK_MARC_ACTIONS.CREATE,
          marcType: MARC_TYPES.AUTHORITY,
        };

        const formProps = {
          initialValues: {
            records: [
              {
                id: 'fd2341be-b34f-4f4b-ad69-872ea4b62142',
                tag: '010',
                content: '$a some content $b test',
              },
            ],
          },
        };

        const { getByRole, rerender } = renderControlNumberField(props, formProps);

        const sourceFile = {
          source: 'folio',
        };

        await act(async () => SourceFileLookup.mock.calls[0][0].onSourceFileSelect(sourceFile));

        expect(getByRole('textbox', { name: 'ui-quick-marc.record.subfield' }).value).toBe('some content');

        rerender(getControlNumberField(props, {
          initialValues: {
            records: [
              {
                id: 'fd2341be-b34f-4f4b-ad69-872ea4b62142',
                tag: '010',
                content: '$a some content2 $b test',
              },
            ],
          },
        }));

        expect(getByRole('textbox', { name: 'ui-quick-marc.record.subfield' }).value).toBe('some content2');
      });
    });

    describe('and FOLIO source file is selected and the next HRID is loading', () => {
      it('should display loading instead of the source file lookup', async () => {
        useAuthorityFileNextHrid.mockReturnValue({
          isLoading: true,
        });

        const { getByTestId, queryByText } = renderControlNumberField({
          action: QUICK_MARC_ACTIONS.CREATE,
          marcType: MARC_TYPES.AUTHORITY,
        });

        expect(queryByText('SourceFileLookup')).toBeNull();
        expect(getByTestId('hridLoading')).toBeVisible();
      });
    });
  });
});
