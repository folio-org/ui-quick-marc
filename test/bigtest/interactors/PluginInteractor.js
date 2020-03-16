import {
  interactor,
} from '@bigtest/interactor';

// https://bigtestjs.io/guides/interactors/introduction/
export default @interactor class PluginInteractor {
  static defaultScope = '[data-test-quick-marc]';
}
