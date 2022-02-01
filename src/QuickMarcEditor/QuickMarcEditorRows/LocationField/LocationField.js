import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { omit } from 'lodash';

import { LocationLookup } from '@folio/stripes/smart-components';

import { QUICK_MARC_ACTIONS } from '../../constants';
import { getLocationValue } from '../../utils';
import { ContentField } from '../ContentField';

export const LocationField = ({
  action,
  input,
  fields,
  isLocationLookupUsed,
  setIsLocationLookupUsed,
  permanentLocation,
  setPermanentLocation,
  ...props
}) => {
  const intl = useIntl();

  const getContentFieldValue = () => {
    const locationField = fields.find(field => field.tag === '852');
    const newInput = omit(input, ['value']);
    const locationValue = getLocationValue(input.value);

    let newInputValue;

    if (action === QUICK_MARC_ACTIONS.EDIT) {
      newInputValue = locationValue
        ? input.value.replace(locationValue, permanentLocation)
        : `${permanentLocation} ${input.value.trim()}`;
    } else {
      newInputValue = permanentLocation;
    }

    locationField.content = newInputValue;
    newInput.value = newInputValue;

    return newInput;
  };

  const isReplacingLocationNeeded = permanentLocation !== getLocationValue(input.value);

  const inputContent = isReplacingLocationNeeded
    ? getContentFieldValue()
    : input;

  return (
    <>
      <ContentField
        input={inputContent}
        {...props}
      />
      <LocationLookup
        label={intl.formatMessage({ id: 'ui-quick-marc.permanentLocationLookup' })}
        onLocationSelected={location => {
          if (!isLocationLookupUsed) {
            setIsLocationLookupUsed(true);
          }

          setPermanentLocation(`$b ${location.code}`);
        }}
        marginBottom0
      />
    </>
  );
};

LocationField.propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.string),
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  })),
  permanentLocation: PropTypes.string.isRequired,
  setPermanentLocation: PropTypes.func.isRequired,
  isLocationLookupUsed: PropTypes.bool.isRequired,
  setIsLocationLookupUsed: PropTypes.func.isRequired,
};
