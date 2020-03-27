import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import { Form } from 'react-final-form';
import { IntlProvider } from 'react-intl';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditorRows from './QuickMarcEditorRows';
import * as utils from './utils';

const values = [
  {
    tag: '001',
    content: '$a f',
  },
  {
    tag: '036',
    content: '$a c',
    indicators: [],
  },
  {
    tag: '999',
    content: '$b f',
  },
];

const renderQuickMarcEditorRows = ({ fields }) => (render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <Form
        onSubmit={jest.fn()}
        render={() => (
          <QuickMarcEditorRows
            fields={fields}
            mutators={{
              insert: jest.fn(),
            }}
          />
        )}
      />
    </MemoryRouter>
  </IntlProvider>,
));

describe('Given Quick Marc Editor Rows', () => {
  afterEach(cleanup);

  it('Than it should display row for each record value', () => {
    const { getAllByTestId } = renderQuickMarcEditorRows({
      fields: {
        map: cb => values.map((value, idx) => cb(`records[${idx}]`, idx)),
        value: values,
      },
    });

    expect(getAllByTestId('quick-marc-editorid').length).toBe(3);
  });

  it('Than it should display row for each record value', () => {
    const isReadOnlySpy = jest.spyOn(utils, 'isReadOnly');
    const hasIndicatorExceptionSpy = jest.spyOn(utils, 'hasIndicatorException');
    const hasAddExceptionSpy = jest.spyOn(utils, 'hasAddException');

    renderQuickMarcEditorRows({
      fields: {
        map: cb => values.map((value, idx) => cb(`records[${idx}]`, idx)),
        value: values,
      },
    });

    expect(isReadOnlySpy.mock.calls.length > values.length).toBeTruthy();
    expect(hasIndicatorExceptionSpy.mock.calls.length > values.length).toBeTruthy();
    expect(hasAddExceptionSpy.mock.calls.length > values.length).toBeTruthy();

    isReadOnlySpy.mockRestore();
    hasIndicatorExceptionSpy.mockRestore();
    hasAddExceptionSpy.mockRestore();
  });
});
