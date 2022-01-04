import { MARC_TYPES } from './marcTypes';

export const EXTERNAL_INSTANCE_APIS = {
  [MARC_TYPES.BIB]: 'inventory/instances',
  [MARC_TYPES.HOLDINGS]: 'holdings-storage/holdings',
  [MARC_TYPES.AUTHORITY]: 'authority-storage/authorities',
};

export const MARC_RECORD_API = 'records-editor/records';
export const MARC_RECORD_STATUS_API = `${MARC_RECORD_API}/status`;
