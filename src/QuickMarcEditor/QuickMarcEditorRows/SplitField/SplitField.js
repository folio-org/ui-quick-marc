import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { TextField } from '@folio/stripes/components';

import css from './SplitField.css';

const propTypes = {
  name: PropTypes.string.isRequired,
};

const SplitField = ({
  name,
}) => {
  const intl = useIntl();

  const renderSubfieldGroup = (fieldProps) => {
    return (
      <Field
        className={css.splitFieldWrapper}
        component={TextField}
        fullWidth
        hasClearIcon={false}
        dirty={false}
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
        marginBottom0
        parse={v => v}
        {...fieldProps}
      />
    );
  };

  return (
    <FieldArray
      name={`${name}.subfieldGroups`}
      isEqual={isEqual}
    >
      {() => (
        <>
          {renderSubfieldGroup({
            disabled: true,
            name: `${name}.subfieldGroups.controlled`,
          })}
          {renderSubfieldGroup({
            disabled: false,
            name: `${name}.subfieldGroups.uncontrolledAlpha`,
          })}
          {renderSubfieldGroup({
            disabled: true,
            name: `${name}.subfieldGroups.zeroSubfield`,
          })}
          {renderSubfieldGroup({
            disabled: false,
            name: `${name}.subfieldGroups.uncontrolledNumber`,
          })}
        </>
      )}
    </FieldArray>
  );
};

SplitField.propTypes = propTypes;

export { SplitField };
