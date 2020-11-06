import { LEADER_TAG } from '../constants';

export const isLastRecord = recordRow => {
  return (
    recordRow.tag === '999'
    && recordRow.indicators
    && recordRow.indicators[0] === 'f'
    && recordRow.indicators[1] === 'f'
  );
};

const READ_ONLY_ROWS = new Set(['001', '005']);

export const isReadOnly = recordRow => (
  READ_ONLY_ROWS.has(recordRow.tag) || isLastRecord(recordRow)
);

const INDICATOR_EXEPTION_ROWS = new Set([LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009']);

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.has(recordRow.tag);

const ADD_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '003', '005', '008']);

export const hasAddException = recordRow => ADD_EXCEPTION_ROWS.has(recordRow.tag);

const DELETE_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '003', '005', '008']);

export const hasDeleteException = recordRow => (
  DELETE_EXCEPTION_ROWS.has(recordRow.tag) || isLastRecord(recordRow)
);

const MOVE_EXCEPTION_ROWS = new Set([LEADER_TAG, '001', '005', '008']);

export const hasMoveException = (recordRow, sibling) => (
  !sibling
  || MOVE_EXCEPTION_ROWS.has(recordRow.tag)
  || MOVE_EXCEPTION_ROWS.has(sibling.tag)
);

export const isMaterialCharsRecord = recordRow => recordRow.tag === '006';
export const isPhysDescriptionRecord = recordRow => recordRow.tag === '007';
export const isFixedFieldRow = recordRow => recordRow.tag === '008';
