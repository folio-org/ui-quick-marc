import React from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { PhysDescriptionField } from './PhysDescriptionField';
import Harness from '../../../../test/jest/helpers/harness';

const renderPhysDescriptionField = ({ name, type }) => render(
  <Harness>
    <Form
      onSubmit={() => {}}
      mutators={arrayMutators}
      render={() => (
        <PhysDescriptionField
          name={name}
          type={type}
        />
      )}
    />
  </Harness>,
);

describe('PhysDescriptionField', () => {
  it('should render PhysDescriptionField', () => {
    const { getByTestId } = renderPhysDescriptionField({
      name: 'records[0].content',
      type: 'a',
    });

    expect(getByTestId('phys-description-field')).toBeDefined();
  });
});
