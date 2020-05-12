import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { SOUND_RECORDING_CONFIG } from './constants';

const SoundRecordingFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-sound-fixed-field
      name={name}
      config={SOUND_RECORDING_CONFIG}
    />
  );
};

SoundRecordingFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

SoundRecordingFixedField.displayName = 'SoundRecordingFixedField';

export default SoundRecordingFixedField;
