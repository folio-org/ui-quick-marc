import { LEADER_TAG } from '../constants';
import {
  BOOK_CONFIG,
  COMPUTER_CONFIG,
  CONTINUING_RESOURCE,
  MAP_CONFIG,
  MIXED_MATERIAL,
  SCORE_CONFIG,
  SOUND_RECORDING_CONFIG,
  VISUAL_MATERIAL_CONFIG,
} from './FixedField/constants';

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

export const getFields = (type, blvl) => {
  switch (true) {
    case ['a', 't'].includes(type) && ['a', 'c', 'd', 'm'].includes(blvl):
      return BOOK_CONFIG.fields;
    case type === 'a' && ['b', 'i', 's'].includes(blvl):
      return CONTINUING_RESOURCE.fields;
    case type === 'm':
      return COMPUTER_CONFIG.fields;
    case ['e', 'f'].includes(type):
      return MAP_CONFIG.fields;
    case type === 'p':
      return MIXED_MATERIAL.fields;
    case ['c', 'd'].includes(type):
      return SCORE_CONFIG.fields;
    case ['i', 'j'].includes(type):
      return SOUND_RECORDING_CONFIG.fields;
    case ['g', 'k', 'o', 'r'].includes(type):
      return VISUAL_MATERIAL_CONFIG.fields;
    default:
      return null;
  }
};
