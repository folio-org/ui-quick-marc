import {
  createGetById,
} from '@folio/stripes-acq-components/test/bigtest/network/configs';

import { MARC_RECORD_API } from '../../../../src/common/constants';

const SCHEMA_NAME = 'marcRecords';

export const configMarcRecords = server => {
  server.get(`${MARC_RECORD_API}/:id`, createGetById(SCHEMA_NAME));
};
