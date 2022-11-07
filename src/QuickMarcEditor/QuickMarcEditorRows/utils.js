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

const READ_ONLY_ROWS_FOR_DERIVE = new Set(['001', '005']);

const READ_ONLY_ROWS_FOR_HOLDINGS = new Set(['001', '004', '005']);

const READ_ONLY_ROWS_FOR_AUTHORITIES = new Set(['001', '005']);

export const isReadOnly = (
  recordRow,
  action = QUICK_MARC_ACTIONS.EDIT,
  marcType = MARC_TYPES.BIB,
) => {
  let rows;

  if (marcType === MARC_TYPES.BIB && recordRow._isLinked) {
    return true;
  }

  if (marcType === MARC_TYPES.BIB) {
    rows = action === QUICK_MARC_ACTIONS.DERIVE
      ? READ_ONLY_ROWS_FOR_DERIVE
      : READ_ONLY_ROWS;
  } else if (marcType === MARC_TYPES.HOLDINGS) {
    rows = READ_ONLY_ROWS_FOR_HOLDINGS;
  } else {
    rows = READ_ONLY_ROWS_FOR_AUTHORITIES;
  }

  return rows.has(recordRow.tag) || isLastRecord(recordRow);
};

const INDICATOR_EXEPTION_ROWS = new Set([LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009']);

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.has(recordRow.tag);

const ADD_EXCEPTION_ROWS = {
  [MARC_TYPES.BIB]: new Set([LEADER_TAG, '001', '003', '005', '008']),
  [MARC_TYPES.HOLDINGS]: new Set([LEADER_TAG, '001', '003', '004', '005', '008']),
  [MARC_TYPES.AUTHORITY]: new Set([LEADER_TAG, '001', '003', '005', '008']),
};

export const hasAddException = (recordRow, marcType = MARC_TYPES.BIB) => {
  return ADD_EXCEPTION_ROWS[marcType].has(recordRow.tag);
};

const DELETE_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '003', '005', '008']);

const DELETE_EXCEPTION_ROWS_FOR_HOLDINGS = new Set([LEADER_TAG, '001', '003', '004', '005', '008']);

export const hasDeleteException = (recordRow, marcType = MARC_TYPES.BIB) => {
  const rows = marcType === MARC_TYPES.HOLDINGS
    ? DELETE_EXCEPTION_ROWS_FOR_HOLDINGS
    : DELETE_EXCEPTION_ROWS;

  return rows.has(recordRow.tag) || isLastRecord(recordRow);
};

const MOVE_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '005', '008']);

const MOVE_EXCEPTION_ROWS_FOR_DERIVE = new Set([LEADER_TAG, '001', '003', '005', '008']);

export const hasMoveException = (recordRow, sibling, action = QUICK_MARC_ACTIONS.EDIT) => {
  const rows = action === QUICK_MARC_ACTIONS.DERIVE
    ? MOVE_EXCEPTION_ROWS_FOR_DERIVE
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
