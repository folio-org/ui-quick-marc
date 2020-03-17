import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import { QuickMarcEditorInteractor } from '../interactors';

describe('Quick MARC plugin', () => {
  const quickMarcEditor = new QuickMarcEditorInteractor();

  let instance;

  setupApplication();

  beforeEach(async function () {
    instance = this.server.create('instance');

    this.visit(`/dummy/edit/${instance.id}`);

    await quickMarcEditor.whenLoaded();
  });

  it('should be rendered with instance', () => {
    expect(quickMarcEditor.isPresent).to.be.true;
    expect(quickMarcEditor.editorInstanceId).to.be.equal(instance.id);
  });
});
