import { MARC_RECORD_API } from '../../../../src/common/constants';

const SCHEMA_NAME = 'marcRecords';

export const configMarcRecords = server => {
  server.get(MARC_RECORD_API, (schema, request) => {
    const record = schema[SCHEMA_NAME].findBy({ parsedRecordId: request.queryParams.instanceId });

    return record
      ? record.attrs
      : new Response(404, { errors: 'record is not found' });
  });

  server.put(`${MARC_RECORD_API}/:id`, (schema, request) => {
    const attrs = JSON.parse(request.requestBody);

    schema[SCHEMA_NAME].findBy({ parsedRecordId: request.params.id }).update(attrs);

    return attrs;
  });
};
