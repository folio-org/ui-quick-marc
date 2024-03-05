import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import FixedField from './FixedField';
import Harness from '../../../../test/jest/helpers/harness';

const configMock = {
  type: 'books',
  fields: [{
    name: 'DtSt',
    type: 'Select',
    length: 1,
    position: 1,
    allowedValues: [{
      code: 'a',
      name: 'test1',
    }, {
      code: 'b',
      name: 'test2',
    }],
  },
  {
    name: 'Relf',
    type: 'Selects',
    bytes: 4,
    position: 2,
    allowedValues: [{
      code: 'c',
      name: 'test1',
    }, {
      code: 'd',
      name: 'test2',
    }],
  },
  {
    name: 'Ctry',
    type: 'String',
    length: 3,
    position: 3,
  }],
};

const marcContext = {
  'DtSt': 'a',
  'Relf': ['c', 'c', 'd', 'd'],
  'Ctry': '|||',
};

const renderFixedField = (config) => (render(
  <Harness>
    <Form
      onSubmit={jest.fn()}
      mutators={{ ...arrayMutators }}
      render={() => (
        <FixedField
          name="records"
          config={config}
          content={marcContext}
        />
      )}
    />
  </Harness>,
));

describe('FixedField', () => {
  it('Should render select with proper options', () => {
    const { getByText, getByTestId } = renderFixedField(configMock);

    expect(getByTestId('fixed-field-Select')).toBeInTheDocument();
    expect(getByText('a - ui-quick-marc.record.fixedField.test1')).toBeInTheDocument();
    expect(getByText('b - ui-quick-marc.record.fixedField.test2')).toBeInTheDocument();
  });

  it('Should render 4 selects with proper options', () => {
    const { getAllByText, getAllByTestId } = renderFixedField(configMock);

    const selects = getAllByTestId('fixed-field-Selects');

    expect(selects).toHaveLength(4);
    expect(getAllByText(/c - ui-quick-marc.record.fixedField.test1/i)).toHaveLength(4);
    expect(getAllByText(/d - ui-quick-marc.record.fixedField.test2/i)).toHaveLength(4);
  });

  it('Should render Ctry as input', () => {
    const { getByTestId } = renderFixedField(configMock);
    const element = getByTestId(/fixed-field-String/i);

    expect(element).toBeInstanceOf(HTMLInputElement);
  });
});
