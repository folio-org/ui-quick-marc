import {
  createGetById,
} from '@folio/stripes-acq-components/test/bigtest/network/configs';

import { INVENTORY_INSTANCE_API } from '../../../../src/common/constants';

const SCHEMA_NAME = 'instances';

export const configInstances = server => {
  server.get(`${INVENTORY_INSTANCE_API}/:id`, createGetById(SCHEMA_NAME));
};
