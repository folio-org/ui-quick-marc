import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Label,
  Row,
  TextField,
} from '@folio/stripes/components';

import styles from './BytesField.css';

export const SUBFIELD_TYPES = {
  BYTE: 'Byte',
  STRING: 'String',
  BYTES: 'Bytes',
};

const renderSubField = (name, config) => {
  const fieldName = `${name}.${config.name}`;
  const label = <FormattedMessage id={`ui-quick-marc.record.fixedField.${config.name}`} />;

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
                        {ariaLabel => (
                          <Field
                            dirty={false}
                            ariaLabel={ariaLabel}
                            name={`${fieldName}[${idx}]`}
                            component={TextField}
                            disabled={config.disabled}
                            className={styles.fixedFieldSubFieldByte}
                            hasClearIcon={false}
                            data-testid={`fixed-field-${config.type}`}
                          />
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

  return (
    <FormattedMessage id={`ui-quick-marc.record.fixedField.${config.name}`}>
      {ariaLabel => (
        <Field
          dirty={false}
          ariaLabel={ariaLabel}
          name={fieldName}
          label={label}
          component={TextField}
          disabled={config.disabled}
          className={styles[`bytesFieldSubField${config.type}`]}
          hasClearIcon={false}
          data-testid={`fixed-field-${config.type}`}
        />
      )}
    </FormattedMessage>
  );
};

export const BytesField = ({ config, name }) => {
  return (
    <Row>
      {
        config.fields.map((field, fieldIdx) => {
          return (
            <Col
              key={fieldIdx}
              data-testid="bytes-field-col"
            >
              {renderSubField(name, field)}
            </Col>
          );
        })
      }
    </Row>
  );
};

BytesField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
};
