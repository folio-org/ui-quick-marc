import React from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { MaterialCharsField } from './MaterialCharsField';

const renderMaterialCharsField = ({ name, type }) => render(
  <Form
    onSubmit={() => {}}
    mutators={arrayMutators}
    render={() => (
      <MaterialCharsField
        name={name}
        type={type}
      />
    )}
  />,
);

describe('MaterialCharsField', () => {
  it('should render MaterialCharsField', () => {
    const { getByTestId } = renderMaterialCharsField({
      name: 'records[0].content',
      type: 'a',
    });

    expect(getByTestId('material-chars-field')).toBeDefined();
  });
});
