import { render } from '@testing-library/react';

import { QUICK_MARC_ACTIONS } from '../../constants';

import { LocationField } from './LocationField';

const fields = [
  {
    id: 'LDR',
    tag: 'LDR',
    content: '00000nu\\\\\\2200000un\\4500',
  },
  {
    id: '1',
    tag: '852',
    content: '$b KU/CC/DI/A $t 3 $h M3',
    indicators: ['0', '1'],
  },
];

const renderLocationField = (props) => (render(
  <LocationField
    action={QUICK_MARC_ACTIONS.EDIT}
    input={{
      value: '$b KU/CC/DI/A $t 3 $h M3',
    }}
    fields={fields}
    permanentLocation="$b KU/CC/DI/A"
    setPermanentLocation={jest.fn()}
    isLocationLookupUsed={false}
    setIsLocationLookupUsed={jest.fn()}
    meta={{
      dirty: false,
    }}
    {...props}
  />,
));

describe('Given LocationField', () => {
  it('should render content field and location lookup', () => {
    const {
      getByRole,
      getByText,
    } = renderLocationField();

    expect(getByRole('textbox')).toBeDefined();
    expect(getByText('LocationLookup')).toBeDefined();
  });

  describe('when permanentLocation is equal to input value', () => {
    it('should display permanentLocation for subfield $b in location field', () => {
      const { getByText } = renderLocationField();

      expect(getByText('$b KU/CC/DI/A $t 3 $h M3')).toBeDefined();
    });
  });

  describe('when permanentLocation is not equal to input value', () => {
    describe('when action is edit', () => {
      describe('when input value contains location subfield', () => {
        it('should display permanentLocation for subfield $b in location field', () => {
          const { getByText } = renderLocationField({
            permanentLocation: '$b E',
          });

          expect(getByText('$b E $t 3 $h M3')).toBeDefined();
        });
      });

      describe('when input value does not contain location subfield', () => {
        it('should display permanentLocation for subfield $b in location field', () => {
          const { getByText } = renderLocationField({
            input: {
              value: '$t 3 $h M3',
            },
            permanentLocation: '$b E',
          });

          expect(getByText('$b E $t 3 $h M3')).toBeDefined();
        });
      });
    });

    describe('when action is create', () => {
      it('should display just subfield $b with permanentLocation value in location field', () => {
        const { getByText } = renderLocationField({
          action: QUICK_MARC_ACTIONS.CREATE,
          permanentLocation: '$b E',
        });

        expect(getByText('$b E')).toBeDefined();
      });
    });
  });
});
