import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import { QuickMarcEditorInteractor } from '../interactors';

const records = [
  {
    tag: '001',
    content: '$a dfd $b asd',
  },
  {
    tag: '008',
    content: {
      Type: 'a',
      BLvl: 'c',
    },
  },
  {
    tag: '047',
    content: '$a bds $b acv',
  },
];

describe('Quick MARC editor', () => {
  const quickMarcEditor = new QuickMarcEditorInteractor();

  let instance;

  setupApplication();

  beforeEach(async function () {
    instance = this.server.create('instance');
    this.server.create('marcRecord', {
      id: instance.id,
      records,
    });

    this.visit(`/dummy/edit/${instance.id}`);

    await quickMarcEditor.whenLoaded();
  });

  it('should be rendered with instance', () => {
    expect(quickMarcEditor.isPresent).to.be.true;
    expect(quickMarcEditor.editorInstanceId).to.be.equal(instance.id);
  });

  it('should render leader row', () => {
    expect(quickMarcEditor.leaderRow.isPresent).to.be.true;
  });

  it('should render record rows (excluding leader row)', () => {
    expect(quickMarcEditor.editorRows().length - 1).to.be.equal(records.length);
  });
});
