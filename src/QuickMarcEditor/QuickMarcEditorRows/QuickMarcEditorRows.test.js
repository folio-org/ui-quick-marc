import React from 'react';
import {
  render,
  fireEvent,
} from '@testing-library/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import defer from 'lodash/defer';

import { runAxeTest } from '@folio/stripes-testing';
import * as stripesCore from '@folio/stripes/core';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditorRows from './QuickMarcEditorRows';
import * as utils from './utils';
import { QUICK_MARC_ACTIONS } from '../constants';
import { MARC_TYPES } from '../../common/constants';

import Harness from '../../../test/jest/helpers/harness';

jest.spyOn(stripesCore, 'Pluggable').mockImplementation(({ onLinkRecord, renderCustomTrigger }) => (
  renderCustomTrigger({ onClick: onLinkRecord })
));

jest.mock('lodash/defer', () => jest.fn());

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useAuthorityLinking: () => ({
    linkAuthority: jest.fn(),
    linkableBibFields: ['100'],
  }),
}));

jest.mock('../../queries', () => ({
  ...jest.requireActual('../../queries'),
  useAuthorityLinkingRules: jest.fn().mockReturnValue({
    linkingRules: [],
    isLoading: false,
  }),
  useAuthoritySourceFiles: jest.fn().mockResolvedValue({
    sourceFiles: [],
    isLoading: false,
  }),
}));

const initValues = [
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
    id: '9',
    tag: '100',
    content: '$a Kirby, Jack, $e creator. $0 http://id.loc.gov/authorities/names/n2019022493',
    authorityId: 'authority-id',
    _isLinked: true,
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
  {
    id: '8',
    authorityId: '09140d44-a515-4b64-9261-845639e75db4',
    _isLinked: false,
    tag: '100',
  },
];

let values = [...initValues];
const addRecordMock = jest.fn().mockImplementation(({ index }) => {
  values.splice(index, 0, {
    id: 'new-1',
    content: '',
  });
});
const deleteRecordMock = jest.fn();
const moveRecordMock = jest.fn();
const markRecordDeletedMock = jest.fn();

const getComponent = (props) => (
  <Harness>
    <Form
      onSubmit={jest.fn()}
      mutators={arrayMutators}
      initialValues={{
        records: initValues,
      }}
      render={() => (
        <QuickMarcEditorRows
          fields={values}
          name="records"
          type="a"
          action={QUICK_MARC_ACTIONS.EDIT}
          marcType={MARC_TYPES.BIB}
          mutators={{
            addRecord: addRecordMock,
            deleteRecord: deleteRecordMock,
            markRecordDeleted: markRecordDeletedMock,
            moveRecord: moveRecordMock,
            markRecordLinked: jest.fn(),
            markRecordUnlinked: jest.fn(),
            restoreRecord: jest.fn(),
          }}
          subtype="test"
          {...props}
        />
      )}
    />
  </Harness>
);

const renderQuickMarcEditorRows = (props = {}) => render(getComponent(props));

describe('Given QuickMarcEditorRows', () => {
  beforeEach(() => {
    values = [...initValues];
    jest.clearAllMocks();
  });

  it('should render with no axe errors', async () => {
    const { container } = renderQuickMarcEditorRows();

    await runAxeTest({
      rootNode: container,
    });
  });

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

    it('should focus the new `tag` field with a delay', async () => {
      const { getAllByRole } = renderQuickMarcEditorRows();
      const [addButton] = getAllByRole('button', { name: 'ui-quick-marc.record.addField' });

      fireEvent.click(addButton);
      expect(defer).toHaveBeenCalled();
    });

    describe('when the subfield is focused', () => {
      it('should have a cursor at the end of the field value', () => {
        const { getByTestId } = renderQuickMarcEditorRows();
        const subfield = getByTestId('content-field-0');
        const valueLength = subfield.value.length;
        const spySetSelectionRange = jest.spyOn(subfield, 'setSelectionRange');

        fireEvent.focus(subfield);
        expect(spySetSelectionRange).toHaveBeenCalledWith(valueLength, valueLength);
      });
    });

    describe('and deleting a new row and saving', () => {
      it('should not mark the row as deleted', () => {
        const {
          getAllByRole,
          getByTestId,
        } = renderQuickMarcEditorRows();

        const [addButton] = getAllByRole('button', { name: 'ui-quick-marc.record.addField' });
        const contentField852 = getByTestId('content-field-6');

        fireEvent.change(contentField852, { target: { value: '' } });

        fireEvent.click(addButton);
        // delete button next to added row
        const deleteButton = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' })[0];

        fireEvent.click(deleteButton);

        expect(markRecordDeletedMock).not.toHaveBeenCalled();
        expect(deleteRecordMock).toHaveBeenCalled();
      });
    });
  });

  describe('when deleting rows', () => {
    it('should call markRecordDeleted 2 times', () => {
      const { getAllByTestId } = renderQuickMarcEditorRows();

      const testIdx1 = 1;
      const testIdx2 = 2;
      const deleteIcon1 = getAllByTestId(`data-test-remove-row-${testIdx1}`);
      const deleteIcon2 = getAllByTestId(`data-test-remove-row-${testIdx2}`);

      fireEvent.click(deleteIcon1[1]);
      fireEvent.click(deleteIcon2[1]);

      expect(markRecordDeletedMock).toHaveBeenCalledTimes(2);
    });

    it('should focus the `tag` field that is located after the deleted field with a delay', async () => {
      const { getAllByRole } = renderQuickMarcEditorRows();
      const [deleteButton] = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

      fireEvent.click(deleteButton);
      expect(defer).toHaveBeenCalled();
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
          action: QUICK_MARC_ACTIONS.DERIVE,
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

  describe('when a field is linked', () => {
    const props = {
      action: QUICK_MARC_ACTIONS.EDIT,
      marcType: MARC_TYPES.BIB,
    };

    it('should display the view authority record icon', () => {
      const { getAllByTestId, getByTestId, rerender } = renderQuickMarcEditorRows(props);

      fireEvent.click(getAllByTestId('link-authority-button')[0]);
      rerender(getComponent(props));
      expect(getByTestId('view-authority-record-link')).toBeVisible();
      expect(getByTestId('view-authority-record-link')).toHaveAttribute(
        'href',
        '/marc-authorities/authorities/authority-id?authRefType=Authorized&headingRef=Kirby, Jack,&segment=search',
      );
    });
  });
});
