import React from 'react';
import { render, cleanup, act, fireEvent, createEvent } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { IndicatorField } from './IndicatorField';

const getComponent = () => (
  <IndicatorField
    name="content"
  />
);

describe('Given indicator field', () => {
  afterEach(cleanup);

  it('should be selected after control focus', async () => {
    let getByTestId;
    const select = jest.fn();

    await act(async () => {
      getByTestId = await render(getComponent()).getByTestId;
    });
    const selectContent = createEvent.focus(getByTestId('indicator-field'), { target: { select } });

    fireEvent(getByTestId('indicator-field'), selectContent);

    expect(select).toHaveBeenCalled();
  });
});
