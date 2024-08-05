import { useContext } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import {
  TextArea,
  HasCommand,
} from '@folio/stripes/components';

import { QuickMarcContext } from '../../../contexts';
import { useSubfieldNavigation } from '../../../hooks';
import {
  UNCONTROLLED_ALPHA,
  UNCONTROLLED_NUMBER,
} from '../../constants';

import css from './SplitField.css';
import { ErrorMessages } from '../ErrorMessages';

const propTypes = {
  name: PropTypes.string.isRequired,
  maxWidth: PropTypes.number,
  fieldId: PropTypes.string.isRequired,
};

const SplitField = ({
  name,
  maxWidth,
  fieldId,
}) => {
  const intl = useIntl();
  const { validationErrorsRef } = useContext(QuickMarcContext);

  const errors = validationErrorsRef.current[fieldId];

  const {
    keyCommands,
    processSubfieldFocus,
  } = useSubfieldNavigation();

  const renderSubfieldGroup = (fieldProps) => {
    return (
      <HasCommand commands={keyCommands}>
        <Field
          className={css.splitFieldWrapper}
          component={TextArea}
          rootClass={css.splitFieldRoot}
          hasClearIcon={false}
          dirty={false}
          aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
          marginBottom0
          parse={v => v}
          style={{ maxWidth: maxWidth - 15 }} // 15px for margin-right
          onFocus={processSubfieldFocus}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          {...fieldProps}
        />
      </HasCommand>
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
            fitContent: true,
          })}
          {renderSubfieldGroup({
            disabled: false,
            name: `${name}.subfieldGroups.${UNCONTROLLED_ALPHA}`,
          })}
          {renderSubfieldGroup({
            disabled: true,
            name: `${name}.subfieldGroups.zeroSubfield`,
            fitContent: true,
          })}
          {renderSubfieldGroup({
            disabled: false,
            name: `${name}.subfieldGroups.${UNCONTROLLED_NUMBER}`,
          })}
          <ErrorMessages errors={errors} />
        </>
      )}
    </FieldArray>
  );
};

SplitField.propTypes = propTypes;

export { SplitField };
