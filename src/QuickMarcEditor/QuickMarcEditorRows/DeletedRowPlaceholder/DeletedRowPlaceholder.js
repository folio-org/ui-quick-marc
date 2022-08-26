import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { Button } from '@folio/stripes/components';

import styles from './DeletedRowPlaceholder.css';

const propTypes = {
  field: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }).isRequired,
  restoreRow: PropTypes.func.isRequired,
};

const DeletedRowPlaceholder = ({
  field,
  restoreRow,
}) => (
  <div className={styles.deletedRowPlaceholder}>
    <span>
      <FormattedMessage
        id="ui-quick-marc.record.fieldDeleted"
        values={{
          tag: field.tag,
        }}
      />
    </span>
    <Button
      buttonStyle="link"
      buttonClass={styles.deletedRowUndoButton}
      onClick={restoreRow}
    >
      <FormattedMessage id="ui-quick-marc.record.fieldDeleted.undo" />
    </Button>
  </div>
);

DeletedRowPlaceholder.propTypes = propTypes;

export { DeletedRowPlaceholder };
