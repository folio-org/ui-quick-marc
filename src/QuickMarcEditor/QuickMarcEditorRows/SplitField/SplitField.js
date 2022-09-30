import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { TextField } from '@folio/stripes/components';

import css from './SplitField.css';

const propTypes = {};

const SplitField = ({
  name,
  field,
}) => {
  const intl = useIntl();

  const renderSubfieldGroup = (subfieldGroup, fieldProps) => {
    return (
      <Field
        className={css.splitFieldWrapper}
        component={TextField}
        fullWidth
        hasClearIcon={false}
        dirty={false}
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
        marginBottom0
        {...fieldProps}
      />
    );
  };

  return (
    <FieldArray name={`${name}.subfieldGroups`}>
      {() => (
        <>
          {renderSubfieldGroup(field.subfieldGroups.controlled, {
            disabled: true,
            name: `${name}.subfieldGroups.controlled`,
          })}
          {renderSubfieldGroup(field.subfieldGroups.uncontrolledAlpha, {
            disabled: false,
            name: `${name}.subfieldGroups.uncontrolledAlpha`,
          })}
          {renderSubfieldGroup(field.subfieldGroups.zeroSubfield, {
            disabled: true,
            name: `${name}.subfieldGroups.zeroSubfield`,
          })}
          {renderSubfieldGroup(field.subfieldGroups.uncontrolledNumber, {
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
