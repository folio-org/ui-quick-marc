import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { IndicatorField } from './IndicatorField';

const getComponent = () => (
  <IndicatorField
    name="content"
    label="test-label"
  />
);

describe('Given indicator field', () => {
  it('should render the field', () => {
    const { getByLabelText } = render(getComponent());

    expect(getByLabelText('test-label')).toBeDefined();
  });

  // it('should be selected after control focus', async () => {
  //   let getByTestId;
  //   const select = jest.fn();

  //   await act(async () => {
  //     getByTestId = await render(getComponent()).getByTestId;
  //   });
  //   const selectContent = createEvent.focus(getByTestId('indicator-field'), { target: { select } });

  //   fireEvent(getByTestId('indicator-field'), selectContent);

  //   expect(select).toHaveBeenCalled();
  // });
});
