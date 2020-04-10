import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  parsedRecordId: () => faker.random.uuid(),
  leader: () => faker.random.uuid(),
  fields: [],
});
