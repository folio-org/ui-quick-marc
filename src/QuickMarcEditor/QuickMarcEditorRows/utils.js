import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
} from '../constants';
import { MARC_TYPES } from '../../common/constants';

export const isLastRecord = recordRow => {
  return (
    recordRow.tag === '999'
    && recordRow.indicators
    && recordRow.indicators[0] === 'f'
    && recordRow.indicators[1] === 'f'
  );
};

const READ_ONLY_ROWS = new Set(['001', '005']);

const READ_ONLY_ROWS_FOR_DUPLICATE = new Set([LEADER_TAG, '001', '005']);

export const isReadOnly = (
  recordRow,
  action = QUICK_MARC_ACTIONS.EDIT,
  marcType = MARC_TYPES.BIB,
) => {
  if (marcType === MARC_TYPES.HOLDINGS) {
    READ_ONLY_ROWS.add('004');
  }

  const rows = action === QUICK_MARC_ACTIONS.DUPLICATE
    ? READ_ONLY_ROWS_FOR_DUPLICATE
    : READ_ONLY_ROWS;

  return rows.has(recordRow.tag) || isLastRecord(recordRow);
};

const INDICATOR_EXEPTION_ROWS = new Set([LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009']);

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.has(recordRow.tag);

const ADD_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '003', '005', '008']);

export const hasAddException = recordRow => ADD_EXCEPTION_ROWS.has(recordRow.tag);

const DELETE_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '003', '005', '008']);

export const hasDeleteException = (recordRow, marcType = MARC_TYPES.BIB) => {
  if (marcType === MARC_TYPES.HOLDINGS) {
    DELETE_EXCEPTION_ROWS.add('004');
  }

  return DELETE_EXCEPTION_ROWS.has(recordRow.tag) || isLastRecord(recordRow);
};

const MOVE_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '005', '008']);

const MOVE_EXCEPTION_ROWS_FOR_DUPLICATE = new Set([LEADER_TAG, '001', '003', '005', '008']);

export const hasMoveException = (recordRow, sibling, action = QUICK_MARC_ACTIONS.EDIT) => {
  const rows = action === QUICK_MARC_ACTIONS.DUPLICATE
    ? MOVE_EXCEPTION_ROWS_FOR_DUPLICATE
    : MOVE_EXCEPTION_ROWS;

  return (
    !sibling
    || rows.has(recordRow.tag)
    || rows.has(sibling.tag)
  );
};

export const isMaterialCharsRecord = recordRow => recordRow.tag === '006';
export const isPhysDescriptionRecord = recordRow => recordRow.tag === '007';
export const isFixedFieldRow = recordRow => recordRow.tag === '008';
