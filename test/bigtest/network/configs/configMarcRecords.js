import { MARC_RECORD_API } from '../../../../src/common/constants';

const SCHEMA_NAME = 'marcRecords';

export const configMarcRecords = server => {
  server.get(MARC_RECORD_API, (schema, request) => {
    const record = schema[SCHEMA_NAME].find(request.queryParams.instanceId);

    return record
      ? record.attrs
      : new Response(404, { errors: 'record is not found' });
  });
};
