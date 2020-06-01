import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

import { STANDARD_PHYS_DESCR_FIELDS } from './constants';

const config = {
  fields: [
    ...STANDARD_PHYS_DESCR_FIELDS,
    {
      name: 'Color',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Physical medium',
    },
    {
      name: 'Type of reproduction',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Production/reproduction details',
    },
    {
      name: 'Positive/negative aspect',
      type: SUBFIELD_TYPES.BYTE,
    },
  ],
};

const MapPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

MapPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

MapPhysDescriptionField.displayName = 'MapPhysDescriptionField';

export default MapPhysDescriptionField;
