import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Label,
  Row,
  TextField,
  AccordionStatus,
  Accordion,
} from '@folio/stripes/components';

import styles from './FixedField.css';

export const SUBFIELD_TYPES = {
  BYTE: 'Byte',
  STRING: 'String',
  BYTES: 'Bytes',
};

const renderSubField = (name, config, collapsed) => {
  const fieldName = `${name}.${config.name}`;
  const label = <FormattedMessage id={`ui-quick-marc.record.fixedField.${config.name}`} />;

  if (config.type === SUBFIELD_TYPES.BYTES) {
    return (
      <FieldArray
        name={fieldName}
        className={styles.collapsedFields}
      >
        {() => {
          return (
            <>
              <Label htmlFor={`${fieldName}[0]`}>
                {label}
              </Label>

              {
                Array.from(Array(config.bytes)).map((v, idx) => {
                  return (
                    <FormattedMessage
                      key={idx}
                      id={`ui-quick-marc.record.fixedField.${config.name}`}
                    >
                      {ariaLabel => (
                        <Field
                          ariaLabel={ariaLabel}
                          name={`${fieldName}[${idx}]`}
                          component={TextField}
                          disabled={config.disabled || collapsed}
                          className={styles.fixedFieldSubFieldByte}
                          hasClearIcon={false}
                          data-testid={`fixed-field-${config.type}`}
                        />
                      )}
                    </FormattedMessage>
                  );
                })
              }
            </>
          );
        }}
      </FieldArray>
    );
  }

  return (
    <FormattedMessage id={`ui-quick-marc.record.fixedField.${config.name}`}>
      {ariaLabel => (
        <Field
          ariaLabel={ariaLabel}
          name={fieldName}
          label={label}
          component={TextField}
          disabled={config.disabled || collapsed}
          className={styles[`fixedFieldSubField${config.type}`]}
          hasClearIcon={false}
          data-testid={`fixed-field-${config.type}`}
        />
      )}
    </FormattedMessage>
  );
};

const FixedField = ({ config, name }) => {
  const closedFields = useMemo(() => config.fields.map((row) => {
    return (
      row.map((col, colIdx) => {
        return col
          ? (
            <Col
              className={styles.collapsedField}
              key={colIdx}
              data-testid="fixed-field-col"
            >
              {renderSubField(name, col, true)}
            </Col>
          ) : (
            <Col
              key={colIdx}
              data-testid="fixed-field-col"
            />
          );
      })
    );
  }), []);

  return (
    <div className={styles.fixedFieldAccordion}>
      <AccordionStatus>
        <Accordion
          separator={false}
          displayWhenClosed={closedFields}
        >
          {
            config.fields.map((row, rowIdx) => {
              return (
                <Row
                  key={rowIdx}
                  data-testid="fixed-field-row"
                >
                  {
                    row.map((col, colIdx) => {
                      const xsColSize = col?.size || config.colSizes[colIdx];
                      const lgColSize = Math.ceil(xsColSize / 2);

                      return col
                        ? (
                          <Col
                            xs={xsColSize}
                            lg={lgColSize}
                            key={colIdx}
                            data-testid="fixed-field-col"
                          >
                            {renderSubField(name, col)}
                          </Col>
                        )
                        : (
                          <Col
                            xs={xsColSize}
                            lg={lgColSize}
                            key={colIdx}
                            data-testid="fixed-field-col"
                          />
                        );
                    })
                  }
                </Row>
              );
            })
          }
        </Accordion>
      </AccordionStatus>
    </div>
  );
};

FixedField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  // collapsed: PropTypes.bool.isRequired,
};

export default FixedField;
