import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useField } from 'react-final-form';

import { SourceFileLookup } from '../../SourceFileLookup';
import { ContentField } from '../ContentField';
import { MARC_TYPES } from '../../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../constants';

const propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  marcType: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
};

const ControlNumberField = ({
  id,
  name,
  marcType,
  action,
}) => {
  const { input, ...inputRest } = useField(name);

  const handleSourceFileSelection = useCallback(() => {
    // TODO: handle generation of HRID + source file prefix here (UIQM-576)
  }, []);

  const canSelectSourceFile = marcType === MARC_TYPES.AUTHORITY && action === QUICK_MARC_ACTIONS.CREATE;

  return (
    <>
      <ContentField
        id={id}
        input={input}
        disabled
        {...inputRest}
      />
      {canSelectSourceFile && (
        <SourceFileLookup
          onSourceFileSelect={handleSourceFileSelection}
        />
      )}
    </>
  );
};

ControlNumberField.propTypes = propTypes;

export { ControlNumberField };
