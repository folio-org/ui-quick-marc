import { LEADER_TAG } from '../constants';

const READ_ONLY_ROWS = [LEADER_TAG, '001', '999'];

export const isReadOnly = recordRow => READ_ONLY_ROWS.includes(recordRow.tag);

const INDICATOR_EXEPTION_ROWS = [LEADER_TAG, '001', '002', '003', '004', '005', '006', '007', '008', '009'];

export const hasIndicatorException = recordRow => INDICATOR_EXEPTION_ROWS.includes(recordRow.tag);

const CANNOT_ADD_AFTER_OR_DUPLICATE_ROWS = [LEADER_TAG, '001', '005', '008'];

export const isCannotAddAfterOrDuplicateRow = recordRow => CANNOT_ADD_AFTER_OR_DUPLICATE_ROWS.includes(recordRow.tag);
