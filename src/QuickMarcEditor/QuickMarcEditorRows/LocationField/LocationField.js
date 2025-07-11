import { useContext } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Field, useField } from 'react-final-form';

import { LocationLookup } from '@folio/stripes/smart-components';

import { ContentField } from '../ContentField';
import { ErrorMessages } from '../ErrorMessages';
import { QuickMarcContext } from '../../../contexts';
import { getLocationValue } from '../../utils';

const propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  fieldId: PropTypes.string.isRequired,
};

const LocationField = ({
  id,
  name,
  fieldId,
}) => {
  const intl = useIntl();
  const { input, ...inputRest } = useField(name);
  const { validationErrorsRef } = useContext(QuickMarcContext);

  const errors = validationErrorsRef.current[fieldId];

  const handleSelectLocation = (location) => {
    const permanentLocation = `$b ${location.code}`;
    const locationValue = getLocationValue(input.value);

    const newInputValue = locationValue
      ? input.value.replace(`$b ${locationValue}`, permanentLocation)
      : `${permanentLocation} ${input.value.trim()}`;

    input.onChange(newInputValue);
  };

  return (
    <>
      <Field
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
        name={`${name}.content`}
        parse={v => v}
        id={id}
        marginBottom0
        input={input}
        {...inputRest}
        component={ContentField}
        error={errors && <ErrorMessages errors={errors} />}
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
