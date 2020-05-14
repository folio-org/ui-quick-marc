import {
  attribute,
  collection,
  interactor,
  Interactor,
  isPresent,
} from '@bigtest/interactor';

import {
  ConfirmationInteractor,
} from '@folio/stripes-acq-components/test/bigtest/interactors';

import { TIMEOUT } from './constants';

export default @interactor class QuickMarcEditorInteractor {
  static defaultScope = '#quick-marc-editor-pane';

  editorInstanceId = attribute('[data-test-quick-marc-editor]', 'data-test-quick-marc-editor');

  editorRows = collection('[data-test-quick-marc-editor-row]');
  leaderRow = new Interactor('[value="LDR"]');
  addRowButton = new Interactor('[data-test-add-row]');
  removeButton = new Interactor('[data-test-remove-row]');
  removeConfirmation = new ConfirmationInteractor('#delete-row-confirmation');
  moveRowUpButton = new Interactor('[data-test-move-up-row]');
  moveRowDownButton = new Interactor('[data-test-move-down-row]');

  saveButton = new Interactor('#quick-marc-record-save');

  isLoaded = isPresent('[data-test-quick-marc-editor]');
  whenLoaded() {
    return this.timeout(TIMEOUT).when(() => this.isLoaded);
  }
}
