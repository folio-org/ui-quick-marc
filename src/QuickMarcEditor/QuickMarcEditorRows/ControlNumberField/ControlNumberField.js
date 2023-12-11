import { useCallback } from 'react';
import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { SourceFileLookup } from '../../SourceFileLookup';
import { ContentField } from '../ContentField';
import { MARC_TYPES } from '../../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../constants';

const propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  marcType: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
};

const ControlNumberField = ({
  id,
  name,
  marcType,
  action,
}) => {
  const intl = useIntl();

  const handleSourceFileSelection = useCallback(() => {
    // TODO: handle generation of HRID + source file prefix here (UIQM-576)
  }, []);

  const canSelectSourceFile = marcType === MARC_TYPES.AUTHORITY && action === QUICK_MARC_ACTIONS.CREATE;

  return (
    <>
      <Field
        component={ContentField}
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
        name={name}
        disabled
        data-testid={id}
        id={id}
        parse={v => v}
      />
      {canSelectSourceFile && (
        <SourceFileLookup
          onSourceFileSelect={handleSourceFileSelection}
        />
      )}
    </>
  );
};

ControlNumberField.propTypes = propTypes;

export { ControlNumberField };
