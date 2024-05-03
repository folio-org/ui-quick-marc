import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useField } from 'react-final-form';

import { LocationLookup } from '@folio/stripes/smart-components';

import { getLocationValue } from '../../utils';
import { ContentField } from '../ContentField';

const propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const LocationField = ({
  id,
  name,
}) => {
  const intl = useIntl();
  const { input, ...inputRest } = useField(name);

  const handleSelectLocation = (location) => {
    const permanentLocation = `$b ${location.code}`;
    const locationSubfield = getLocationValue(input.value);

    const newInputValue = locationSubfield
      ? input.value.replace(locationSubfield, permanentLocation)
      : `${permanentLocation} ${input.value.trim()}`;

    input.onChange(newInputValue);
  };

  return (
    <>
      <ContentField
        id={id}
        input={input}
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
        {...inputRest}
      />
      <LocationLookup
        label={intl.formatMessage({ id: 'ui-quick-marc.permanentLocationLookup' })}
        marginBottom0
        onLocationSelected={handleSelectLocation}
      />
    </>
  );
};

LocationField.propTypes = propTypes;

export { LocationField };
