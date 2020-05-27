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
  let getByTestId;
  const select = jest.fn();

  afterEach(cleanup);

  it('content should be focused', async () => {
    await act(async () => {
      getByTestId = await render(getComponent()).getByTestId;
    });
    const selectContent = createEvent.focus(getByTestId('indicator-field'), { target: { select } });

    fireEvent(getByTestId('indicator-field'), selectContent);

    expect(select).toHaveBeenCalled();
  });
});
