import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import { QuickMarcEditorInteractor } from '../interactors';

const records = [
  {
    tag: '001',
    content: '$a dfdac $b asd',
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
  {
    tag: '048',
    content: '$a bds $b acv',
  },
  {
    tag: '049',
    content: '$a bds $b acv',
  },
  {
    tag: '245',
    content: '$s hjg k',
  },
];

describe('Quick MARC editor', () => {
  const quickMarcEditor = new QuickMarcEditorInteractor();

  let instance;

  setupApplication();

  beforeEach(async function () {
    instance = this.server.create('instance');
    this.server.create('marcRecord', {
      parsedRecordId: instance.id,
      leader: '04706cam a2200865Ii 4500',
      fields: records,
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

  describe('add new record', () => {
    beforeEach(async function () {
      await quickMarcEditor.addRowButton.click();
    });

    it('new record should be added (including leader row)', () => {
      expect(quickMarcEditor.editorRows().length).to.be.equal(records.length + 2);
    });
  });

  describe('move record down by clicking on move down button', () => {
    let siblingRow;

    beforeEach(async function () {
      await quickMarcEditor.moveRowDownButton.click();
      siblingRow = quickMarcEditor.editorRows[3];
      // await quickMarcEditor.moveRowUpButton.click();
    });

    it('record should be moved down', () => {
      expect(quickMarcEditor.editorRows[4]).to.be.equal(siblingRow);
    });
  });

  describe('move record up by clicking on move up button', () => {
    let siblingRow;

    beforeEach(async function () {
      await quickMarcEditor.moveRowUpButton.click();
      siblingRow = quickMarcEditor.editorRows[4];
    });

    it('record should be moved up', () => {
      expect(quickMarcEditor.editorRows[3]).to.be.equal(siblingRow);
    });
  });

  describe('after pressing remove button', () => {
    beforeEach(async function () {
      await quickMarcEditor.removeButton.click();
    });

    it('should be render confirmation modal', () => {
      expect(quickMarcEditor.removeConfirmation.isPresent).to.be.true;
    });
  });

  describe('press remove button and confirm removing', () => {
    beforeEach(async function () {
      await quickMarcEditor.removeButton.click();
      await quickMarcEditor.removeConfirmation.confirm();
    });

    it('record should be removed', () => {
      expect(quickMarcEditor.editorRows().length).to.be.equal(records.length);
    });
  });

  describe('press collapse button on fixed fields', () => {
    beforeEach(async function () {
      await quickMarcEditor.collapseButton.click();
    });

    it('fixed fields should be collapsed', () => {
      expect(quickMarcEditor.isFixedFieldCollapsed).to.be.true;
    });
  });

  describe('after save', () => {
    beforeEach(async function () {
      await quickMarcEditor.moveRowDownButton.click();
      await quickMarcEditor.saveButton.click();
    });

    it('editor should be closed', () => {
      expect(quickMarcEditor.isPresent).to.be.false;
    });
  });
});
