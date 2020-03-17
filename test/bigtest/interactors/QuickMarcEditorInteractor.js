import {
  interactor,
  isPresent,
  attribute,
} from '@bigtest/interactor';

import { TIMEOUT } from './constants';

// https://bigtestjs.io/guides/interactors/introduction/
export default @interactor class QuickMarcEditorInteractor {
  static defaultScope = '#quick-marc-editor-pane';

  editorInstanceId = attribute('[data-test-quick-marc-editor]', 'data-test-quick-marc-editor');

  isLoaded = isPresent('[data-test-quick-marc-editor]');
  whenLoaded() {
    return this.timeout(TIMEOUT).when(() => this.isLoaded);
  }
}
