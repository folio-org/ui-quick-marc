import React, {
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import QuickMarcEditor from './QuickMarcEditor';
import {
  QUICK_MARC_ACTIONS,
} from './constants';
import {
  MARC_TYPES,
} from '../common/constants';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  initialValues: PropTypes.object.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  onClose: PropTypes.func.isRequired,
};

const QuickMarcCreateBibWrapper = ({
  action,
  onClose,
  initialValues,
  marcType,
}) => {
  const [httpError] = useState(null);

  const validate = useCallback(() => {
    // TODO: Will be implemented in UIQM-415
    return 'Not implemented';
  }, []);

  const onSubmit = useCallback(() => {
    // TODO: Will be implemented in UIQM-415
    return Promise.reject();
  }, []);

  return (
    <QuickMarcEditor
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      httpError={httpError}
      validate={validate}
    />
  );
};

QuickMarcCreateBibWrapper.propTypes = propTypes;

export default QuickMarcCreateBibWrapper;
