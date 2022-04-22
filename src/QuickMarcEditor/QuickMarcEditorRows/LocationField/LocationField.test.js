import {
  render,
  fireEvent,
} from '@testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { QUICK_MARC_ACTIONS } from '../../constants';

import { LocationField } from './LocationField';

const newLocation = { code: 'NEWLOCATION' };

jest.mock('@folio/stripes/smart-components', () => ({
  LocationLookup: ({ onLocationSelected }) => (
    <div>
      <span>LocationLookup</span>
      <button
        onClick={() => onLocationSelected(newLocation)}
      >
        Select location
      </button>
    </div>
  )
}))

const getLocationField = (props = {}) => (
  <Form
    onSubmit={jest.fn()}
    mutators={{ ...arrayMutators }}
    initialValues={{
      location: '$b KU/CC/DI/A $t 3 $h M3',
    }}
    render={() => (
      <LocationField
        id="id-1"
        action={QUICK_MARC_ACTIONS.EDIT}
        name="location"
        {...props}
      />
    )}
  />
);

const renderLocationField = (props = {}) => render(getLocationField(props));

describe('Given LocationField', () => {
  it('should render content field and location lookup', () => {
    const {
      getByRole,
      getByText,
    } = renderLocationField();

    expect(getByRole('textbox')).toBeDefined();
    expect(getByText('LocationLookup')).toBeDefined();
  });

  describe('when selecting a new location', () => {
    describe('when action is edit', () => {
      it('should replace subfield $b with new location value in location field', () => {
        const { getByText } = renderLocationField();

        fireEvent.click(getByText('Select location'));

        expect(getByText('$b NEWLOCATION $t 3 $h M3')).toBeDefined();
      });
    });

    describe('when action is create', () => {
      it('should set subfield $b with new location value in location field', () => {
        const { getByText } = renderLocationField({
          action: QUICK_MARC_ACTIONS.CREATE,
          input: {
            value: '$a ',
          },
        });

        fireEvent.click(getByText('Select location'));

        expect(getByText('$b NEWLOCATION')).toBeDefined();
      });
    });
  });
});
