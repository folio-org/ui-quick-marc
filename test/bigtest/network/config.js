import {
  configInstances,
  configMarcRecords,
} from './configs';

export default function config() {
  configInstances(this);
  configMarcRecords(this);
}
