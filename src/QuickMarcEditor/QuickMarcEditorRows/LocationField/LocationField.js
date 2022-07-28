import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useField } from 'react-final-form';

import { LocationLookup } from '@folio/stripes/smart-components';

import { QUICK_MARC_ACTIONS } from '../../constants';
import { getLocationValue } from '../../utils';
import { ContentField } from '../ContentField';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const LocationField = ({
  id,
  name,
  action,
}) => {
  const intl = useIntl();
  const { input, ...inputRest } = useField(name);
  const locationLookupUsed = useRef(false);
  const [permanentLocation, setPermanentLocation] = useState(getLocationValue(input.value));

  useEffect(() => {
    const locationValue = getLocationValue(input.value);

    const newInputValue = locationValue
      ? input.value.replace(locationValue, permanentLocation)
      : `${permanentLocation} ${input.value.trim()}`;

    if (locationLookupUsed.current) {
      input.onChange(newInputValue);
    } else {
      input.onChange(input.value);
    }

    locationLookupUsed.current = false;
  }, [permanentLocation, input, action]);

  return (
    <>
      <ContentField
        id={id}
        input={input}
        {...inputRest}
      />
      <LocationLookup
        label={intl.formatMessage({ id: 'ui-quick-marc.permanentLocationLookup' })}
        marginBottom0
        onLocationSelected={location => {
          locationLookupUsed.current = true;
          setPermanentLocation(`$b ${location.code}`);
        }}
      />
    </>
  );
};

LocationField.propTypes = propTypes;

export { LocationField };
