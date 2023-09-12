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

const MOVE_EXCEPTION_ROWS = {
  [QUICK_MARC_ACTIONS.CREATE]: new Set([LEADER_TAG]),
  [QUICK_MARC_ACTIONS.EDIT]: new Set([LEADER_TAG]),
  [QUICK_MARC_ACTIONS.DERIVE]: new Set([LEADER_TAG]),
};

export const hasMoveException = (recordRow, sibling, action = QUICK_MARC_ACTIONS.EDIT) => {
  const rows = MOVE_EXCEPTION_ROWS[action];

  return (
    !sibling
    || rows.has(recordRow.tag)
    || rows.has(sibling.tag)
  );
};
