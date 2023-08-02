import React from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { render } from '@folio/jest-config-stripes/testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { SplitField } from './SplitField';

const initialValues = {
  test: {
    controlled: [],
    uncontrolledAlpha: [],
    zeroSubfield: [],
    uncontrolledNumber: [],
  },
};

const renderSplitField = () => render(
  <Form
    onSubmit={() => {}}
    mutators={arrayMutators}
    initialValues={initialValues}
    render={() => (
      <SplitField
        name="test"
      />
    )}
  />,
);

describe('Given SplitField', () => {
  it('should render 4 subfield inputs', async () => {
    const { getAllByRole } = renderSplitField();

    expect(getAllByRole('textbox', { name: 'ui-quick-marc.record.subfield' })).toHaveLength(4);
  });

  it('should disable controlled and zero subfield inputs', async () => {
    const { container } = renderSplitField();

    const controlled = container.querySelector('textarea[name="test.subfieldGroups.controlled"]');
    const uncontrolledAlpha = container.querySelector('textarea[name="test.subfieldGroups.uncontrolledAlpha"]');
    const uncontrolledNumber = container.querySelector('textarea[name="test.subfieldGroups.uncontrolledNumber"]');
    const zeroSubfield = container.querySelector('textarea[name="test.subfieldGroups.zeroSubfield"]');

    expect(controlled.disabled).toBeTruthy();
    expect(uncontrolledAlpha.disabled).toBeFalsy();
    expect(zeroSubfield.disabled).toBeTruthy();
    expect(uncontrolledNumber.disabled).toBeFalsy();
  });
});
