import { LEADER_TAG } from '../constants';

export const isLastRecord = recordRow => {
  return (
    recordRow.tag === '999'
    && recordRow.indicators
    && recordRow.indicators[0] === 'f'
    && recordRow.indicators[1] === 'f'
  );
};

export const isReadOnly = recordRow => (
  recordRow.tag === '001' || isLastRecord(recordRow)
);

const INDICATOR_EXEPTION_ROWS = [LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009'];

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.includes(recordRow.tag);

const ADD_EXCEPTION_ROWS = [LEADER_TAG, '001', '003', '005', '008'];

export const hasAddException = recordRow => ADD_EXCEPTION_ROWS.includes(recordRow.tag);

const DELETE_EXCEPTION_ROWS = [LEADER_TAG, '001', '003', '005', '008'];

export const hasDeleteException = recordRow => (
  DELETE_EXCEPTION_ROWS.includes(recordRow.tag) || isLastRecord(recordRow)
);

const MOVE_EXCEPTION_ROWS = [LEADER_TAG, '001', '005', '008'];

export const hasMoveException = (recordRow, sibling) => (
  !sibling
  || MOVE_EXCEPTION_ROWS.includes(recordRow.tag)
  || MOVE_EXCEPTION_ROWS.includes(sibling.tag)
);

const FIXED_ROWS = ['008'];

export const isFixedFieldsRow = recordRow => FIXED_ROWS.includes(recordRow.tag);
