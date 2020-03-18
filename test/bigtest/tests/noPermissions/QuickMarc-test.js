import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../helpers/setup-application';
import { QuickMarcEditorInteractor } from '../../interactors';

describe('Organizations list without permissions', () => {
  setupApplication({
    hasAllPerms: false,
    permissions: {
    },
  });

  const quickMarcEditor = new QuickMarcEditorInteractor();

  let instance;

  beforeEach(async function () {
    instance = this.server.create('instance');

    this.visit(`/dummy/edit/${instance.id}`);
  });

  it("Quick MARC plugin shouldn't be rendered", () => {
    expect(quickMarcEditor.isPresent).to.be.false;
  });
});
