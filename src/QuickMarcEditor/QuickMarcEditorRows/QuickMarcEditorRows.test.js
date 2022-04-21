import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditorRows from './QuickMarcEditorRows';
import * as utils from './utils';

import { QUICK_MARC_ACTIONS } from '../constants';
import { MARC_TYPES } from '../../common/constants';

const values = [
  {
    id: '1',
    tag: '001',
    content: '$a f',
    isProtected: true,
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
    id: '7',
    tag: '852',
    content: '$b KU/CC/DI/M $t 3 $h M3',
    indicators: ['0', '1'],
  },
  {
    id: '3',
    tag: '999',
    content: '$b f',
    isProtected: true,
  },
];

const fields = {
  map: cb => values.map((value, idx) => cb(value, idx)),
  value: values,
};

const addRecordMock = jest.fn();
const deleteRecordMock = jest.fn();
const moveRecordMock = jest.fn();
const setDeletedRecordsMock = jest.fn();

const renderQuickMarcEditorRows = (props = {}) => (render(
  <MemoryRouter>
    <Form
      mutators={{ ...arrayMutators }}
      onSubmit={jest.fn()}
      render={() => (
        <QuickMarcEditorRows
          fields={fields}
          name="records"
          type="a"
          mutators={{
            addRecord: addRecordMock,
            deleteRecord: deleteRecordMock,
            moveRecord: moveRecordMock,
          }}
          subtype="test"
          setDeletedRecords={setDeletedRecordsMock}
          {...props}
        />
      )}
    />
  </MemoryRouter>,
));

describe('Given QuickMarcEditorRows', () => {
  afterEach(cleanup);

  it('should display row for each record value', () => {
    const { getAllByTestId } = renderQuickMarcEditorRows();

    expect(getAllByTestId('quick-marc-editorid').length).toBe(values.length);
  });

  it('should display row for each record value', () => {
    const isReadOnlySpy = jest.spyOn(utils, 'isReadOnly');
    const hasIndicatorExceptionSpy = jest.spyOn(utils, 'hasIndicatorException');
    const hasAddExceptionSpy = jest.spyOn(utils, 'hasAddException');
    const hasDeleteExceptionSpy = jest.spyOn(utils, 'hasDeleteException');
    const hasMoveExceptionSpy = jest.spyOn(utils, 'hasMoveException');
    const isFixedRowSpy = jest.spyOn(utils, 'isFixedFieldRow');
    const isMaterialCharsRecordSpy = jest.spyOn(utils, 'isPhysDescriptionRecord');
    const isPhysDescriptionRecordSpy = jest.spyOn(utils, 'isMaterialCharsRecord');

    renderQuickMarcEditorRows();

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

  describe('when add a new row', () => {
    it('should handle addRecord', () => {
      const { getAllByRole } = renderQuickMarcEditorRows();

      const [addButton] = getAllByRole('button', { name: 'ui-quick-marc.record.addField' });

      fireEvent.click(addButton);

      expect(addRecordMock).toHaveBeenCalled();
    });
  });

  describe('when deleting rows', () => {
    it('should call setDeletedRecords 2 times', () => {
      const { getAllByRole } = renderQuickMarcEditorRows();

      const deleteIcons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

      fireEvent.click(deleteIcons[0]);
      fireEvent.click(deleteIcons[1]);

      expect(setDeletedRecordsMock).toHaveBeenCalledTimes(2);
    });

    it('should handle deleteRecord', () => {
      const { getAllByRole } = renderQuickMarcEditorRows();

      const [deleteButton] = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

      fireEvent.click(deleteButton);

      expect(deleteRecordMock).toHaveBeenCalled();
    });
  });

  describe('when there are protected fields', () => {
    describe('when action is edit and marcType is not holdings', () => {
      it('should display protected field popover icons', () => {
        const { getAllByTestId } = renderQuickMarcEditorRows({
          action: QUICK_MARC_ACTIONS.EDIT,
          marcType: MARC_TYPES.BIB,
        });

        expect(getAllByTestId('quick-marc-protected-field-popover').length).toBe(2);
      });
    });

    describe('when action is not edit', () => {
      it('should not display protected field popover icons', () => {
        const { queryByTestId } = renderQuickMarcEditorRows({
          action: QUICK_MARC_ACTIONS.DUPLICATE,
          marcType: MARC_TYPES.BIB,
        });

        expect(queryByTestId('quick-marc-protected-field-popover')).toBeNull();
      });
    });

    describe('when marcType is holdings', () => {
      it('should not display protected field popover icons', () => {
        const { queryByTestId } = renderQuickMarcEditorRows({
          action: QUICK_MARC_ACTIONS.EDIT,
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(queryByTestId('quick-marc-protected-field-popover')).toBeNull();
      });
    });
  });
});
