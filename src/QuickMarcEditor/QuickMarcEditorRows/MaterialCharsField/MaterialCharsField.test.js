import React from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { MaterialCharsField } from './MaterialCharsField';
import Harness from '../../../../test/jest/helpers/harness';

const renderMaterialCharsField = ({ name, type }) => render(
  <Harness>
    <Form
      onSubmit={() => {}}
      mutators={arrayMutators}
      render={() => (
        <MaterialCharsField
          name={name}
          type={type}
        />
      )}
    />
  </Harness>,
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
