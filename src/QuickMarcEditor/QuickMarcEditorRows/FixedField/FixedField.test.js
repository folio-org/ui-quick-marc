import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { IntlProvider } from 'react-intl';

import '@folio/stripes-acq-components/test/jest/__mock__';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [4, 4, 4],
  fields: [
    [
      undefined,
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Type',
      },
    ],
    [
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'ELvl',
      },
      undefined,
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Relf',
      },
    ],
    [
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
  ],
};
const fields = config.fields
  .reduce((acc, row) => ([
    ...acc,
    ...row.filter(field => field),
  ]), []);
const messages = fields
  .reduce((acc, { name }) => ({ ...acc, [`ui-quick-marc.record.fixedField.${name}`]: name }), {});

const renderFixedField = () => (render(
  <IntlProvider locale="en" messages={messages}>
    <MemoryRouter>
      <Form
        onSubmit={jest.fn()}
        mutators={{ ...arrayMutators }}
        render={() => (
          <FixedField
            name="records"
            config={config}
          />
        )}
      />
    </MemoryRouter>
  </IntlProvider>,
));

describe('Given Fixed Field', () => {
  afterEach(cleanup);

  it('Than it should display all rows from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    expect(getAllByTestId('fixed-field-row').length).toBe(config.fields.length);
  });

  it('Than it should display all cols from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const colLength = config.fields.reduce((acc, row) => acc + row.length, 0);

    expect(getAllByTestId('fixed-field-col').length).toBe(colLength);
  });

  it('Than it should display all fields from passed config', () => {
    const { getByText } = renderFixedField();

    fields
      .forEach(({ name }) => {
        expect(getByText(name)).toBeDefined();
      });
  });

  it('Than it should display byte fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const byteFields = fields.filter(({ type }) => type === SUBFIELD_TYPES.BYTE);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.BYTE}`).length).toBe(byteFields.length);
  });

  it('Than it should display bytes fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const bytesFieldsLength = fields
      .filter(({ type }) => type === SUBFIELD_TYPES.BYTES)
      .reduce((acc, field) => acc + field.bytes, 0);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.BYTES}`).length).toBe(bytesFieldsLength);
  });

  it('Than it should display string fields from passed config', () => {
    const { getAllByTestId } = renderFixedField();

    const stringFields = fields.filter(({ type }) => type === SUBFIELD_TYPES.STRING);

    expect(getAllByTestId(`fixed-field-${SUBFIELD_TYPES.STRING}`).length).toBe(stringFields.length);
  });
});
