import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import classNames from 'classnames';

import {
  Label,
  TextField,
  Tooltip,
  Select,
} from '@folio/stripes/components';

import { FIXED_FIELD_MAX_LENGTH } from '../../../common/constants';

import styles from './BytesField.css';

export const SUBFIELD_TYPES = {
  BYTE: 'Byte',
  STRING: 'String',
  BYTES: 'Bytes',
  SELECT: 'Select',
  SELECTS: 'Selects',
};

const renderSubField = (name, config, intl) => {
  const fieldName = `${name}.${config.name}`;
  const label = config.noLabel ? null : <FormattedMessage id={`ui-quick-marc.record.fixedField.${config.name}`} />;
  const hint = config.hint ? config.hint : config.name;
  const labelHint = <FormattedMessage id={`ui-quick-marc.record.fixedField.tip.${hint}`} />;
  const defaultValue = new Array(config.length || 1).fill('\\').join('');
  const invalidValue = <FormattedMessage id="ui-quick-marc.record.fixedField.invalid.value" />;

  const addInvalidOptions = (value, options) => {
    let invalidOption = {};
    let invalidValueStyle = '';

    if (value && !options.some(option => option.value === value)) {
      invalidOption = {
        label: <>{value} - {invalidValue}</>,
        value,
        disabled: true,
      };
      invalidValueStyle = styles.selectInvalidOption;

      return {
        options: [
          invalidOption,
          ...options,
        ],
        invalidValueStyle,
      };
    }

    return {
      options,
      invalidValueStyle,
    };
  };

  const error = (ref) => {
    return (ref.current?.value)
      ? !config.options.some(x => x.value === ref.current.value)
      : false;
  };

  if (config.type === SUBFIELD_TYPES.BYTES) {
    return (
      <FieldArray name={fieldName}>
        {() => {
          return (
            <div className={styles.bytesFieldSubFieldBytes}>
              <Label htmlFor={`${fieldName}[0]`}>
                {label}
              </Label>

              <div className={styles.bytesFieldSubFieldBytesList}>
                {
                  Array.from(Array(config.bytes)).map((v, idx) => {
                    return (
                      <FormattedMessage
                        key={idx}
                        id={`ui-quick-marc.record.fixedField.${config.name}`}
                      >
                        {([ariaLabel]) => (

                          <Tooltip
                            id={`ui-quick-marc.record.fixedField-${config.name}${idx}`}
                            text={labelHint}
                            placement="bottom-start"
                          >
                            {({ ref, ariaIds }) => (
                              <Field
                                inputRef={ref}
                                dirty={false}
                                ariaLabel={ariaLabel}
                                aria-labelledby={ariaIds.text}
                                name={`${fieldName}[${idx}]`}
                                component={TextField}
                                maxLength={FIXED_FIELD_MAX_LENGTH}
                                disabled={config.disabled}
                                className={styles.fixedFieldSubFieldByte}
                                hasClearIcon={false}
                                data-testid={`fixed-field-${config.type}`}
                                parse={value => value || defaultValue}
                                defaultValue={defaultValue}
                              />
                            )}
                          </Tooltip>
                        )}
                      </FormattedMessage>
                    );
                  })
                }
              </div>
            </div>
          );
        }}
      </FieldArray>
    );
  }

  if (config.type === SUBFIELD_TYPES.SELECTS) {
    return (
      <FieldArray name={fieldName}>
        {() => {
          return (
            <div className={styles.bytesFieldSubFieldBytes}>
              <Label htmlFor={`${fieldName}[0]`}>
                {label}
              </Label>

              <div className={styles.bytesFieldSubFieldSelects}>
                {
                  Array.from(Array(config.bytes)).map((v, idx) => {
                    const initialValue = config?.initialValue[idx];
                    const { options, invalidValueStyle } = addInvalidOptions(initialValue, config.options);

                    return (
                      <FormattedMessage
                        key={idx}
                        id={`ui-quick-marc.record.fixedField.${config.name}`}
                      >
                        {([ariaLabel]) => (

                          <Tooltip
                            id={`ui-quick-marc.record.fixedField-${config.name}${idx}`}
                            text={labelHint}
                            placement="bottom-start"
                          >
                            {({ ref, ariaIds }) => (
                              <Field
                                inputRef={ref}
                                dirty={false}
                                error={error(ref)}
                                aria-label={ariaLabel}
                                aria-labelledby={ariaIds.text}
                                name={`${fieldName}[${idx}]`}
                                initialValue={initialValue}
                                component={Select}
                                disabled={config.disabled}
                                dataOptions={options}
                                data-testid={`fixed-field-${config.type}`}
                                selectClass={invalidValueStyle}
                              />
                            )}
                          </Tooltip>
                        )}
                      </FormattedMessage>
                    );
                  })
                }
              </div>
            </div>
          );
        }}
      </FieldArray>
    );
  }

  if (config.type === SUBFIELD_TYPES.SELECT) {
    const { options, invalidValueStyle } = addInvalidOptions(config.initialValue, config.options);

    return (
      <div className={styles.bytesFieldSubFieldSelect}>
        <Label htmlFor={`${fieldName}`}>
          {label}
        </Label>
        <FormattedMessage id={`ui-quick-marc.record.fixedField.${config.name}`}>
          {([ariaLabel]) => (
            <Tooltip
              id={`ui-quick-marc.record.fixedField-${config.name}`}
              text={labelHint}
              placement="bottom-start"
            >
              {({ ref, ariaIds }) => (
                <Field
                  required={error(ref)}
                  inputRef={ref}
                  dirty={false}
                  error={error(ref)}
                  name={fieldName}
                  aria-label={ariaLabel}
                  aria-labelledby={ariaIds.text}
                  initialValue={config.initialValue}
                  component={Select}
                  disabled={config.disabled}
                  dataOptions={options}
                  data-testid={`fixed-field-${config.type}`}
                  selectClass={invalidValueStyle}
                />
              )}
            </Tooltip>
          )}
        </FormattedMessage>
      </div>
    );
  }

  const getMaxLengthByType = config.type === SUBFIELD_TYPES.BYTE ? FIXED_FIELD_MAX_LENGTH : config.length;
  const textFieldClasses = classNames(
    styles[`bytesFieldSubField${config.type}`],
    {
      [styles.noLabelField]: config.noLabel,
      [styles.disabledField]: config.disabled,
      [styles.width40]: config.width40,
      [styles.width46]: config.width46,
      [styles.width48]: config.width48,
      [styles.width72]: config.width72,
      [styles.width82]: config.width82,
    },
  );

  const getTextField = (textFieldProps = {}) => (
    <Field
      dirty={false}
      name={fieldName}
      label={label}
      ariaLabel={intl.formatMessage({ id: `ui-quick-marc.record.fixedField.${config.name}` })}
      component={TextField}
      disabled={config.disabled}
      maxLength={getMaxLengthByType}
      className={textFieldClasses}
      hasClearIcon={false}
      data-testid={`fixed-field-${config.type}`}
      defaultValue={defaultValue}
      {...textFieldProps}
    />
  );

  if (config.noLabel) {
    return getTextField();
  }

  return (
    <Tooltip
      id={`ui-quick-marc.record.fixedField-${config.name}`}
      text={labelHint}
      placement="bottom-start"
    >
      {({ ref, ariaIds }) => getTextField({
        inputRef: ref,
        'aria-labelledby': ariaIds.text,
      })}
    </Tooltip>
  );
};

export const BytesField = ({ config, name, id }) => {
  const intl = useIntl();

  return (
    <div
      className={styles.bytesFieldRow}
      data-testid={id || `row-${name}`}
    >
      {
        config.fields.map((field, fieldIdx) => {
          return (
            <div
              key={fieldIdx}
              data-testid="bytes-field-col"
            >
              {renderSubField(name, field, intl)}
            </div>
          );
        })
      }
    </div>
  );
};

BytesField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  id: PropTypes.string,
};

BytesField.defaultProps = {
  id: '',
};
