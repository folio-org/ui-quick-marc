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
    id: '1',
    tag: '001',
    content: '$a f',
  },
  {
    id: '2',
    tag: '036',
    content: '$a c',
    indicators: [],
  },
  {
    id: '3',
    tag: '999',
    content: '$b f',
  },
];

const messages = {
  'ui-quick-marc.record.moveUpRow': 'Move field up a row',
  'ui-quick-marc.record.moveDownRow': 'Move field down a row',
  'ui-quick-marc.record.field': 'Field',
  'ui-quick-marc.record.indicator': 'Indicator',
  'ui-quick-marc.record.subfield': 'Subfield',
  'ui-quick-marc.record.addField': 'Add a new field',
  'ui-quick-marc.record.deleteField': 'Delete this field',
};

const renderQuickMarcEditorRows = ({ fields }) => (render(
  <IntlProvider locale="en" messages={messages}>
    <MemoryRouter>
      <Form
        onSubmit={jest.fn()}
        render={() => (
          <QuickMarcEditorRows
            fields={fields}
            mutators={{
              addRecord: jest.fn(),
              deleteRecord: jest.fn(),
              moveRecord: jest.fn(),
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
    const hasDeleteExceptionSpy = jest.spyOn(utils, 'hasDeleteException');
    const hasMoveExceptionSpy = jest.spyOn(utils, 'hasMoveException');

    renderQuickMarcEditorRows({
      fields: {
        map: cb => values.map((value, idx) => cb(`records[${idx}]`, idx)),
        value: values,
      },
    });

    expect(isReadOnlySpy.mock.calls.length > values.length).toBeTruthy();
    expect(hasIndicatorExceptionSpy.mock.calls.length > values.length).toBeTruthy();
    expect(hasAddExceptionSpy.mock.calls.length > values.length).toBeTruthy();
    expect(hasDeleteExceptionSpy.mock.calls.length > values.length).toBeTruthy();
    expect(hasMoveExceptionSpy.mock.calls.length > values.length).toBeTruthy();

    isReadOnlySpy.mockRestore();
    hasIndicatorExceptionSpy.mockRestore();
    hasAddExceptionSpy.mockRestore();
    hasDeleteExceptionSpy.mockRestore();
    hasMoveExceptionSpy.mockRestore();
  });
});
