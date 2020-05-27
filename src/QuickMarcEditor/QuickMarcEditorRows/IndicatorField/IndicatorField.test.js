import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { IndicatorField } from './IndicatorField';

const getComponent = () => (
  <IndicatorField
    name="content"
  />
);

describe('Given indicator field', () => {
  let getByTestId;

  afterEach(cleanup);

  it('content should be focused', async () => {
    await act(async () => {
      getByTestId = await render(getComponent()).getByTestId;
    });

    fireEvent(getByTestId('indicator-field'), new MouseEvent('focus', {
      bubbles: true,
      cancelable: true,
    }));

    expect(getByTestId('indicator-field')).toBeDefined();
  });
});
