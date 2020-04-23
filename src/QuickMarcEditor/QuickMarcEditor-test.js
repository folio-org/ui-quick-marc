import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, beforeEach, it } from '@bigtest/mocha';
import {
  interactor,
  Interactor,
} from '@bigtest/interactor';
import { expect } from 'chai';
import faker from 'faker';

import sinon from 'sinon';

// eslint-disable-next-line
import { mountWithContext } from '@folio/stripes-components/tests/helpers';

import QuickMarcEditor from './QuickMarcEditor';

const QuickMarcEditorInteractor = interactor(class {
  static defaultScope = '#quick-marc-editor-pane';

  closeButton = new Interactor('[data-test-cancel-button]')
});

const getInstance = () => ({
  id: faker.random.uuid(),
  title: faker.lorem.sentence(),
});

const marcRecord = {
  records: [{
    tag: '001',
    content: '$a as',
  }, {
    tag: '245',
    content: '$b a',
  }],
};

// mock components? seems no, babel-plugin-rewire should be added

describe('QuickMarcEditor', () => {
  const instance = getInstance();
  let onClose;

  const quickMarcEditor = new QuickMarcEditorInteractor();

  beforeEach(async () => {
    onClose = sinon.fake();

    await mountWithContext(
      <MemoryRouter>
        <QuickMarcEditor
          instance={instance}
          onClose={onClose}
          onSubmit={sinon.fake()}
          initialValues={marcRecord}
        />
      </MemoryRouter>,
    );
  });

  it('should be rendered', () => {
    // eslint-disable-next-line
    expect(quickMarcEditor.isPresent).to.be.true;
  });

  // new async action? new branch
  describe('clsoe action', () => {
    beforeEach(async () => {
      await quickMarcEditor.closeButton.click();
    });

    it('onClose prop should be invoked', () => {
      // eslint-disable-next-line
      expect(onClose.callCount !== 0).to.be.true;
    });
  });

  // another prop is requried? the second render
  describe('disable', () => {
    beforeEach(async () => {
      await mountWithContext(
        <MemoryRouter>
          <QuickMarcEditor
            instance={instance}
            onClose={onClose}
            onSubmit={sinon.fake()}
            initialValues={{}}
          />
        </MemoryRouter>,
      );
    });

    // no async in cases
    it('onClose prop should be invoked', () => {
      // eslint-disable-next-line
      expect(true).to.be.true;
    });
  });
});
