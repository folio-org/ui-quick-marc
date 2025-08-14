import {
  render,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { LocationField } from './LocationField';
import Harness from '../../../../test/jest/helpers/harness';

const newLocation = { code: 'NEWLOCATION' };

jest.mock('@folio/stripes/smart-components', () => ({
  // eslint-disable-next-line react/prop-types
  LocationLookup: ({ onLocationSelected }) => (
    <div>
      <span>LocationLookup</span>
      <button
        type="button"
        onClick={() => onLocationSelected(newLocation)}
      >
        Select location
      </button>
    </div>
  ),
}));

const getLocationField = (initialValues) => (
  <Harness>
    <Form
      onSubmit={jest.fn()}
      mutators={{ ...arrayMutators }}
      initialValues={{
        location: '$b KU/CC/DI/A $t 3 $h M3',
      }}
      {...initialValues}
      render={() => (
        <LocationField
          id="id-1"
          name="location"
        />
      )}
    />
  </Harness>
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
    describe('when location already exists', () => {
      it('should replace subfield $b with new location value in location field', () => {
        const {
          getByText,
          getByTestId,
        } = renderLocationField();

        fireEvent.click(getByText('Select location'));

        expect(getByTestId('id-1').value).toEqual('$b NEWLOCATION $t 3 $h M3');
      });
    });

    describe('when location is empty', () => {
      it('should set subfield $b with new location value in location field', () => {
        const {
          getByText,
          getByTestId,
        } = renderLocationField({
          initialValues: {
            location: '$a',
          },
        });

        fireEvent.click(getByText('Select location'));

        expect(getByTestId('id-1').value).toEqual('$b NEWLOCATION $a');
      });
    });
  });
});
