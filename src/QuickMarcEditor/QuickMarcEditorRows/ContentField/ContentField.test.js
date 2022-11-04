import React from 'react';
import { render, cleanup, act } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { ContentField } from './ContentField';
import * as utils from './utils';

const getComponent = (value) => (
  <ContentField
    name="content"
    meta={{}}
    input={{ value }}
    id="content-field-0"
  />
);

describe('Given Content Field', () => {
  let getResizeStylesSpy;

  beforeEach(() => {
    getResizeStylesSpy = jest.spyOn(utils, 'getResizeStyles');
  });

  afterEach(() => {
    getResizeStylesSpy.mockRestore();
    cleanup();
  });

  it('should calculate resize styles after mount', async () => {
    await act(async () => {
      await render(getComponent('$a dg'));
    });

    expect(getResizeStylesSpy).toHaveBeenCalled();
    expect(getResizeStylesSpy.mock.calls.length).toBe(1);
  });

  it('should set up resize styles', async () => {
    const height = '42.5px';
    let getByTestId;

    getResizeStylesSpy.mockReturnValue({
      height,
    });

    await act(async () => {
      getByTestId = await render(getComponent('$a dg')).getByTestId;
    });

    expect(getByTestId('content-field-0').style.height).toBe(height);
  });

  it('should calculate resize styles after input value change', async () => {
    await act(async () => {
      const { rerender } = render(getComponent('$a dg'));

      await rerender(getComponent('$a dg sdas $ asf'));
    });

    expect(getResizeStylesSpy).toHaveBeenCalled();
    expect(getResizeStylesSpy.mock.calls.length).toBe(2);
  });
});
