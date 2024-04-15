import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
} from '../constants';
import { MARC_TYPES } from '../../common/constants';
import { fieldMatchesDescription } from '../utils';

const INDICATOR_EXEPTION_ROWS = new Set([LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009']);

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.has(recordRow.tag);

const ADD_EXCEPTION_ROWS = {
  [MARC_TYPES.BIB]: new Set([LEADER_TAG, '001', '005']),
  [MARC_TYPES.HOLDINGS]: new Set([LEADER_TAG, '001', '005']),
  [MARC_TYPES.AUTHORITY]: new Set([LEADER_TAG, '001', '005']),
};

export const hasAddException = (recordRow, marcType = MARC_TYPES.BIB) => {
  return ADD_EXCEPTION_ROWS[marcType].has(recordRow.tag);
};

const MOVE_EXCEPTION_ROWS = new Set([{ tag: LEADER_TAG }]);

const MOVE_EXCEPTION_ROWS_FOR_CREATE_DERIVE = new Set([{ tag: LEADER_TAG }, { tag: '001' }, { tag: '005' }, { tag: '999', indicators: ['f', 'f'] }]);

export const hasMoveException = (recordRow, sibling, action = QUICK_MARC_ACTIONS.EDIT) => {
  const rows = action === QUICK_MARC_ACTIONS.EDIT
    ? MOVE_EXCEPTION_ROWS
    : MOVE_EXCEPTION_ROWS_FOR_CREATE_DERIVE;

  return (
    !sibling
    || fieldMatchesDescription(recordRow, rows)
    || fieldMatchesDescription(sibling, rows)
  );
};
