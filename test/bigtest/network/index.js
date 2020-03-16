import { defaultsDeep } from 'lodash';

import {
  acqMirageModules,
  buildMirageModules,
} from '@folio/stripes-acq-components/test/bigtest/network';

import baseConfig from './config';

const modules = defaultsDeep(
  { baseConfig },
  acqMirageModules,
  buildMirageModules(require.context('./', true, /\.js$/)),
);

export default modules;
