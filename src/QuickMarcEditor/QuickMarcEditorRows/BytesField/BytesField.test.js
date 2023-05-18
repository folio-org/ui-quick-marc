import React from 'react';
import { render } from '@testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import '@folio/stripes-acq-components/test/jest/__mock__';

import {
  BytesField,
  SUBFIELD_TYPES,
} from './BytesField';
import Harness from '../../../../test/jest/helpers/harness';

const config = {
  fields: [
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Type',
    },
    {
      type: SUBFIELD_TYPES.STRING,
      name: 'Desc',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Relf',
    },
    {
      type: SUBFIELD_TYPES.BYTES,
      name: 'Lang',
      bytes: 3,
    },
    {
      type: SUBFIELD_TYPES.SELECT,
      name: 'Mdt',
      options: [{ value: 'a', label: 'a' }],
    },
  ],
};

const renderFixedField = () => (render(
  <Harness>
    <Form
      onSubmit={jest.fn()}
      mutators={{ ...arrayMutators }}
      render={() => (
        <BytesField
          name="records"
          config={config}
        />
      )}
    />
  </Harness>,
));

describe('Given Bytes Field', () => {
  it('should display all cols from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    expect(getAllByTestId('bytes-field-col').length).toBe(config.fields.length);
  });

  it('should display all fields from passed config', () => {
    const { getByText } = renderFixedField();

    config.fields
      .forEach(({ name }) => {
        expect(getByText(`ui-quick-marc.record.fixedField.${name}`)).toBeDefined();
      });
  });

  it('should display byte fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const byteFields = config.fields.filter(({ type }) => type === SUBFIELD_TYPES.BYTE);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.BYTE}`).length).toBe(byteFields.length);
  });

  it('should display select fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const byteFields = config.fields.filter(({ type }) => type === SUBFIELD_TYPES.SELECT);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.SELECT}`).length).toBe(byteFields.length);
  });

  it('should display bytes fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const bytesFieldsLength = config.fields
      .filter(({ type }) => type === SUBFIELD_TYPES.BYTES)
      .reduce((acc, field) => acc + field.bytes, 0);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.BYTES}`).length).toBe(bytesFieldsLength);
  });

  it('should display string fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const stringFields = config.fields.filter(({ type }) => type === SUBFIELD_TYPES.STRING);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.STRING}`).length).toBe(stringFields.length);
  });
});
