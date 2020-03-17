import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import { PluginInteractor } from '../interactors';

describe('Quick MARC plugin', () => {
  const plugin = new PluginInteractor();

  setupApplication();

  beforeEach(function () {
    this.visit('/dummy/edit/ads123');
  });

  it('should be rendered', () => {
    expect(plugin.isPresent).to.be.true;
  });
});
