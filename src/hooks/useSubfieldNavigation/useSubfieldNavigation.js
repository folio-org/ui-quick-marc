import { useCallback } from 'react';

import {
  cursorToNextSubfield,
  cursorToPrevSubfield,
} from './utils';
import { KEYBOARD_COMMAND_NAMES } from '../../common/constants';

export const useSubfieldNavigation = () => {
  const processSubfieldFocus = useCallback(({ target }) => {
    if (!target.value) {
      return;
    }

    const end = target.value.length;

    target.setSelectionRange(end, end);
  }, []);

  const keyCommands = [{
    name: KEYBOARD_COMMAND_NAMES.NEXT_SUBFIELD,
    handler: cursorToNextSubfield,
  }, {
    name: KEYBOARD_COMMAND_NAMES.PREV_SUBFIELD,
    handler: cursorToPrevSubfield,
  }];

  return { processSubfieldFocus, keyCommands };
};
