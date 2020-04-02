import { LEADER_TAG } from '../constants';

const isLastRecord = recordRow => {
  return (
    recordRow.tag === '999'
    && recordRow.indicators
    && recordRow.indicators[0] === 'f'
    && recordRow.indicators[0] === 'f'
  );
};

export const isReadOnly = recordRow => (
  recordRow.tag === '001'
  || (
    isLastRecord(recordRow)
  )
);

const INDICATOR_EXEPTION_ROWS = [LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009'];

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.includes(recordRow.tag);

const ADD_AND_DELETE_EXCEPTION_ROWS = [LEADER_TAG, '001', '005', '008'];

export const hasAddException = recordRow => ADD_AND_DELETE_EXCEPTION_ROWS.includes(recordRow.tag);

export const hasDeleteException = recordRow => (
  ADD_AND_DELETE_EXCEPTION_ROWS.includes(recordRow.tag)
  || (
    isLastRecord(recordRow)
  )
);
