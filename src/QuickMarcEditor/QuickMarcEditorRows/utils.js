import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
} from '../constants';
import { MARC_TYPES } from '../../common/constants';

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
