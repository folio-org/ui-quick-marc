import React, {
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { omit } from 'lodash';
import { FormSpy } from 'react-final-form';

import { LocationLookup } from '@folio/stripes/smart-components';

import { QUICK_MARC_ACTIONS } from '../../constants';
import { getLocationValue } from '../../utils';
import { ContentField } from '../ContentField';

const spySubscription = { values: true };

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  id: PropTypes.string.isRequired,
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

const LocationField = ({
  id,
  action,
  input,
  fields,
  isLocationLookupUsed,
  setIsLocationLookupUsed,
  ...props
}) => {
  const intl = useIntl();
  const [permanentLocation, setPermanentLocation] = useState(getLocationValue(input.value));

  const getContentFieldValue = useCallback(() => {
    const locationField = fields.find(field => field.id === id);

    if (!locationField) {
      return input;
    }

    const newInput = omit(input, ['value']);
    const locationValue = getLocationValue(locationField.content);

    let newInputValue;

    if (action === QUICK_MARC_ACTIONS.EDIT) {
      newInputValue = locationValue
        ? locationField.content.replace(locationValue, permanentLocation)
        : `${permanentLocation} ${input.value.trim()}`;
    } else {
      newInputValue = permanentLocation;
    }

    locationField.content = newInputValue;
    newInput.value = newInputValue;

    return newInput;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permanentLocation, input]);

  const changeRecords = useCallback(({ values }) => {
    if (values?.records) {
      const locationField = values.records.find(field => field.id === id);

      const matchedLocation = getLocationValue(locationField?.content);

      setPermanentLocation(matchedLocation);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        marginBottom0
        onLocationSelected={location => {
          if (!isLocationLookupUsed) {
            setIsLocationLookupUsed(true);
          }

          setPermanentLocation(`$b ${location.code}`);
        }}
      />
      <FormSpy
        subscription={spySubscription}
        onChange={changeRecords}
      />
    </>
  );
};

LocationField.propTypes = propTypes;

export { LocationField };
