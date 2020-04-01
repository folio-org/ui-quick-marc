import {
  attribute,
  collection,
  interactor,
  Interactor,
  isPresent,
} from '@bigtest/interactor';

import { TIMEOUT } from './constants';

export default @interactor class QuickMarcEditorInteractor {
  static defaultScope = '#quick-marc-editor-pane';

  editorInstanceId = attribute('[data-test-quick-marc-editor]', 'data-test-quick-marc-editor');

  editorRows = collection('[data-test-quick-marc-editor-row]');
  leaderRow = new Interactor('[value="LDR"]');
  addRowButton = new Interactor('[data-test-add-row]')

  isLoaded = isPresent('[data-test-quick-marc-editor]');
  whenLoaded() {
    return this.timeout(TIMEOUT).when(() => this.isLoaded);
  }
}
