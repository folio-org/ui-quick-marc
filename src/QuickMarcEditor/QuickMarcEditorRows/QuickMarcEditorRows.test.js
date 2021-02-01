import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import { Form } from 'react-final-form';

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
    id: '4',
    tag: '006',
    content: {},
  },
  {
    id: '6',
    tag: '007',
    content: {},
  },
  {
    id: '5',
    tag: '008',
    content: {},
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

const setDeletedRecords = jest.fn();

const renderQuickMarcEditorRows = ({ fields }) => (render(
  <MemoryRouter>
    <Form
      onSubmit={jest.fn()}
      render={() => (
        <QuickMarcEditorRows
          fields={fields}
          name="records"
          type="a"
          mutators={{
            addRecord: jest.fn(),
            deleteRecord: jest.fn(),
            moveRecord: jest.fn(),
          }}
          subtype="test"
          setDeletedRecords={setDeletedRecords}
        />
      )}
    />
  </MemoryRouter>,
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

    expect(getAllByTestId('quick-marc-editorid').length).toBe(values.length);
  });

  it('Than it should display row for each record value', () => {
    const isReadOnlySpy = jest.spyOn(utils, 'isReadOnly');
    const hasIndicatorExceptionSpy = jest.spyOn(utils, 'hasIndicatorException');
    const hasAddExceptionSpy = jest.spyOn(utils, 'hasAddException');
    const hasDeleteExceptionSpy = jest.spyOn(utils, 'hasDeleteException');
    const hasMoveExceptionSpy = jest.spyOn(utils, 'hasMoveException');
    const isFixedRowSpy = jest.spyOn(utils, 'isFixedFieldRow');
    const isMaterialCharsRecordSpy = jest.spyOn(utils, 'isPhysDescriptionRecord');
    const isPhysDescriptionRecordSpy = jest.spyOn(utils, 'isMaterialCharsRecord');

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
    expect(isFixedRowSpy.mock.calls.length > values.length).toBeTruthy();
    expect(isMaterialCharsRecordSpy.mock.calls.length > values.length).toBeTruthy();
    expect(isPhysDescriptionRecordSpy.mock.calls.length > values.length).toBeTruthy();

    isReadOnlySpy.mockRestore();
    hasIndicatorExceptionSpy.mockRestore();
    hasAddExceptionSpy.mockRestore();
    hasDeleteExceptionSpy.mockRestore();
    hasMoveExceptionSpy.mockRestore();
    isFixedRowSpy.mockRestore();
    isMaterialCharsRecordSpy.mockRestore();
    isPhysDescriptionRecordSpy.mockRestore();
  });

  describe('Deleting rows', () => {
    it('should call setDeletedRecords 2 times', () => {
      const { getAllByTestId } = renderQuickMarcEditorRows({
        fields: {
          map: cb => values.map((value, idx) => cb(`records[${idx}]`, idx)),
          value: values,
        },
      });

      const testIdx1 = 0;
      const testIdx2 = 1;
      const deleteIcon1 = getAllByTestId(`data-test-remove-row-${testIdx1}`);
      const deleteIcon2 = getAllByTestId(`data-test-remove-row-${testIdx2}`);

      fireEvent.click(deleteIcon1[1]);
      fireEvent.click(deleteIcon2[1]);

      expect(setDeletedRecords).toHaveBeenCalledTimes(2);
    });
  });
});
