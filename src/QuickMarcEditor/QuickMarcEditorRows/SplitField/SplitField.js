import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import {
  TextArea,
  HasCommand,
} from '@folio/stripes/components';

import { useSubfieldNavigation } from '../../../hooks';

import css from './SplitField.css';

const propTypes = {
  name: PropTypes.string.isRequired,
  maxWidth: PropTypes.number,
};

const SplitField = ({
  name,
  maxWidth,
}) => {
  const intl = useIntl();

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
            name: `${name}.subfieldGroups.uncontrolledAlpha`,
          })}
          {renderSubfieldGroup({
            disabled: true,
            name: `${name}.subfieldGroups.zeroSubfield`,
            fitContent: true,
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
