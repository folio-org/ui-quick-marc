import { render } from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { ControlNumberField } from './ControlNumberField';
import { MARC_TYPES } from '../../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../constants';
import Harness from '../../../../test/jest/helpers/harness';

const getControlNumberField = (props = {}, initialValues) => (
  <Form
    onSubmit={jest.fn()}
    mutators={{ ...arrayMutators }}
    initialValues={{
      controlNumber: 'n 50000331',
    }}
    {...initialValues}
    render={() => (
      <ControlNumberField
        id="id-1"
        name="controlNumber"
        marcType={MARC_TYPES.AUTHORITY}
        action={QUICK_MARC_ACTIONS.CREATE}
        {...props}
      />
    )}
  />
);

const renderControlNumberField = (props = {}) => render(getControlNumberField(props), { wrapper: Harness });

describe('Given ControlNumberField', () => {
  it('should render content field', () => {
    const {
      getByRole,
      getByText,
    } = renderControlNumberField();

    expect(getByRole('textbox')).toBeDefined();
    expect(getByText('ui-quick-marc.sourceFileLookup')).toBeDefined();
  });

  describe('when marc type is not AUTHORITY', () => {
    it('should not render source file lookup', () => {
      const { queryByText } = renderControlNumberField({
        marcType: MARC_TYPES.BIB,
      });

      expect(queryByText('ui-quick-marc.sourceFileLookup')).toBeNull();
    });
  });

  describe('when action is not CREATE', () => {
    beforeAll(() => {
      jest.mock('../../SourceFileLookup', () => ({
        SourceFileLookup: ({ onSourceFileSelect }) => (
          <button type="button" onClick={() => onSourceFileSelect({ target: { value: 'test-source-file-id' } })}>Select file</button>
        ),
      }));
    });

    it('should not render source file lookup', () => {
      const { queryByText } = renderControlNumberField({
        action: QUICK_MARC_ACTIONS.EDIT,
      });

      expect(queryByText('ui-quick-marc.sourceFileLookup')).toBeNull();
    });
  });
});
