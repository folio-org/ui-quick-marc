import React from 'react';
import { render, cleanup, act } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { IndicatorField } from './IndicatorField';

const getComponent = () => (
  <IndicatorField
    name="content"
  />
);

describe('Given indicator field', () => {
  afterEach(cleanup);

  it('content should be focused', async () => {
    let getByTestId;

    await act(async () => {
      getByTestId = await render(getComponent()).getByTestId;
    });

    expect(getByTestId('indicator-field')).toBeDefined();
  });
});
