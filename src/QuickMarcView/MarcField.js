import React, {
  Fragment,
  useCallback,
} from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { AppIcon } from '@folio/stripes/core';
import { Tooltip } from '@folio/stripes/components';

import { normalizeIndicator } from './utils';
import styles from './MarcField.css';

const MarcField = ({
  field,
  showLinkIcon,
  isPrint,
}) => {
  const intl = useIntl();

  const fieldTag = Object.keys(field)[0];
  const hasIndicators = typeof field[fieldTag] !== 'string';
  const subFields = hasIndicators
    ? field[fieldTag].subfields.map((subFieldTag, index) => {
      const subKey = Object.keys(subFieldTag)[0];

      const subfieldValue = field[fieldTag].isHighlighted
        ? <mark>{subFieldTag[subKey]}</mark>
        : subFieldTag[subKey];

      return (
        <Fragment key={`subfield-${index}-${subKey}`}>
          <span>&#8225;</span>
          {subKey}
          {' '}
          {subfieldValue}
          {' '}
        </Fragment>
      );
    })
    : field[fieldTag].replace(/\\/g, ' ');

  const renderLinkIcon = useCallback(() => {
    if (!hasIndicators || isPrint) {
      return null;
    }

    // get authority record id from $9 subfield
    const authorityId = field[fieldTag].subfields.find(subfield => Boolean(subfield['9']))?.['9'];

    if (!authorityId) {
      return null;
    }

    return (
      <Tooltip
        id="marc-authority-tooltip"
        text={intl.formatMessage({ id: 'ui-quick-marc.linkedToMarcAuthority' })}
      >
        {({ ref, ariaIds }) => (
          <Link
            to={`/marc-authorities/authorities/${authorityId}?segment=search`}
            target="_blank"
            ref={ref}
            aria-labelledby={ariaIds.text}
            data-testid={`authority-app-link-${authorityId}`}
          >
            <AppIcon
              size="small"
              app="marc-authorities"
            />
          </Link>
        )}
      </Tooltip>
    );
  }, [field, fieldTag, intl, hasIndicators, isPrint]);

  return (
    <tr data-test-instance-marc-field>
      <td>
        {showLinkIcon && renderLinkIcon()}
      </td>
      <td>
        {fieldTag}
      </td>

      {
        hasIndicators && (
          <td className={styles.indicators}>
            {`${normalizeIndicator(field[fieldTag].ind1)} ${normalizeIndicator(field[fieldTag].ind2)}`}
          </td>
        )
      }

      <td colSpan={hasIndicators ? 2 : 3}>
        {subFields}
      </td>
    </tr>
  );
};

MarcField.propTypes = {
  field: PropTypes.object.isRequired,
  isPrint: PropTypes.bool,
  showLinkIcon: PropTypes.bool.isRequired,
};

MarcField.defaultProps = {
  isPrint: false,
};

export default MarcField;
