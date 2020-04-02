import { LEADER_TAG } from '../constants';
import { is999ffRow } from '../../common/utils';

export const isReadOnly = recordRow => (
  recordRow.tag === '001'
  || (
    is999ffRow(recordRow)
  )
);

const INDICATOR_EXEPTION_ROWS = [LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009'];

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.includes(recordRow.tag);

const ADD_AND_DELETE_EXCEPTION_ROWS = [LEADER_TAG, '001', '005', '008'];

export const hasAddException = recordRow => ADD_AND_DELETE_EXCEPTION_ROWS.includes(recordRow.tag);

export const hasDeleteException = recordRow => (
  ADD_AND_DELETE_EXCEPTION_ROWS.includes(recordRow.tag)
  || (
    is999ffRow(recordRow)
  )
);
