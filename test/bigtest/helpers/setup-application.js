import { setupStripesCore } from '@folio/stripes/core/test';
import mirageOptions from '../network';
import PluginHarness from './PluginHarness';

mirageOptions.serverType = 'miragejs';

export default function setupApplication({
  scenarios,
  hasAllPerms = true,
} = {}) {
  setupStripesCore({
    mirageOptions,
    scenarios,
    stripesConfig: { hasAllPerms },

    // setup a dummy app for the plugin that renders a harness.
    modules: [{
      type: 'app',
      name: '@folio/ui-dummy',
      displayName: 'dummy.title',
      route: '/dummy',
      module: PluginHarness,
    }],

    translations: {
      'dummy.title': 'Dummy',
    },
  });
}
