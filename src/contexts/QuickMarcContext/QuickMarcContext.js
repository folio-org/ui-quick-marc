import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import { getIsSharedFromUrl } from './utils';

const QuickMarcContext = createContext();

const propTypes = {
  action: PropTypes.string.isRequired,
  marcType: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  basePath: PropTypes.string.isRequired,
};

const QuickMarcProvider = ({
  children,
  action,
  marcType,
  basePath,
  isUsingRouter,
  isShared,
}) => {
  const history = useHistory();
  const location = useLocation();
  const [instance, setInstance] = useState(null);
  const [marcRecord, setMarcRecord] = useState(null);
  const [selectedSourceFile, setSelectedSourceFile] = useState(null);
  const [_relatedRecordVersion, setRelatedRecordVersion] = useState();
  const validationErrors = useRef({});
  const continueAfterSave = useRef(false);

  const isSharedRef = useRef(isUsingRouter ? getIsSharedFromUrl(history.location.search) : isShared);

  const getIsShared = useCallback(() => {
    return isSharedRef.current;
  }, []);

  const setIsShared = useCallback((_isShared) => {
    if (isUsingRouter) {
      const searchParams = new URLSearchParams(location.search);

      if (_isShared) {
        searchParams.set('shared', true);
      } else {
        searchParams.delete('shared');
      }

      history.replace({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
    }

    isSharedRef.current = _isShared;
  }, [location, history, isUsingRouter]);

  const setValidationErrors = useCallback((newValidationErrors) => {
    validationErrors.current = newValidationErrors;
  }, []);

  const contextValue = useMemo(() => ({
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrorsRef: validationErrors,
    setValidationErrors,
    relatedRecordVersion: _relatedRecordVersion,
    setRelatedRecordVersion,
    continueAfterSave,
    action,
    marcType,
    setInstance,
    instance,
    initialValues: marcRecord,
    setMarcRecord,
    basePath,
    isUsingRouter,
    isShared: isSharedRef.current,
    setIsShared,
    getIsShared,
  }), [
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrors,
    setValidationErrors,
    _relatedRecordVersion,
    setRelatedRecordVersion,
    continueAfterSave,
    action,
    marcType,
    setInstance,
    instance,
    marcRecord,
    setMarcRecord,
    basePath,
    isUsingRouter,
    setIsShared,
    getIsShared,
  ]);

  return (
    <QuickMarcContext.Provider value={contextValue}>
      {children}
    </QuickMarcContext.Provider>
  );
};

QuickMarcProvider.propTypes = propTypes;

export {
  QuickMarcContext,
  QuickMarcProvider,
};
