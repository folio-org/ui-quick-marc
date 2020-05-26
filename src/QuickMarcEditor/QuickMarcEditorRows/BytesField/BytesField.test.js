import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { IntlProvider } from 'react-intl';

import '@folio/stripes-acq-components/test/jest/__mock__';

import {
  BytesField,
  SUBFIELD_TYPES,
} from './BytesField';

const config = {
  fields: [
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Type',
    },
    {
      type: SUBFIELD_TYPES.STRING,
      name: 'ELvl',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Relf',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Ctrl',
    },
    {
      type: SUBFIELD_TYPES.BYTES,
      name: 'Lang',
      bytes: 3,
    },
  ],
};

const messages = config.fields
  .reduce((acc, { name }) => ({ ...acc, [`ui-quick-marc.record.fixedField.${name}`]: name }), {});

const renderFixedField = () => (render(
  <IntlProvider locale="en" messages={messages}>
    <MemoryRouter>
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
    </MemoryRouter>
  </IntlProvider>,
));

describe('Given Bytes Field', () => {
  afterEach(cleanup);

  it('Than it should display all cols from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    expect(getAllByTestId('bytes-field-col').length).toBe(config.fields.length);
  });

  it('Than it should display all fields from passed config', () => {
    const { getByText } = renderFixedField();

    config.fields
      .forEach(({ name }) => {
        expect(getByText(name)).toBeDefined();
      });
  });

  it('Than it should display byte fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const byteFields = config.fields.filter(({ type }) => type === SUBFIELD_TYPES.BYTE);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.BYTE}`).length).toBe(byteFields.length);
  });

  it('Than it should display bytes fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const bytesFieldsLength = config.fields
      .filter(({ type }) => type === SUBFIELD_TYPES.BYTES)
      .reduce((acc, field) => acc + field.bytes, 0);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.BYTES}`).length).toBe(bytesFieldsLength);
  });

  it('Than it should display string fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const stringFields = config.fields.filter(({ type }) => type === SUBFIELD_TYPES.STRING);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.STRING}`).length).toBe(stringFields.length);
  });
});
