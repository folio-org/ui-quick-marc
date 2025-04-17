import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useLocation,
  useHistory,
} from 'react-router-dom';
import PropTypes from 'prop-types';

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
}) => {
  const location = useLocation();
  const history = useHistory();
  const [instance, setInstance] = useState(null);
  const [marcRecord, setMarcRecord] = useState(null);
  const [selectedSourceFile, setSelectedSourceFile] = useState(null);
  const [_relatedRecordVersion, setRelatedRecordVersion] = useState();
  const validationErrors = useRef({});
  const continueAfterSave = useRef(false);
  const isSharedRef = useRef(new URLSearchParams(location.search).get('shared') === 'true');

  const setIsShared = useCallback((_isShared) => {
    const searchParams = new URLSearchParams(location.search);

    if (_isShared) {
      searchParams.append('shared', true);
    } else {
      searchParams.delete('shared');
    }

    // still need to apply `shared` parameter to the url and push to history
    // because if a user refreshes the page after "Save & keep editing" - all values in context
    // will be lost and we'll have an incorrect isShared state
    isSharedRef.current = _isShared;
    history.push({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  }, [location, history]);

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
    isSharedRef,
    setIsShared,
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
    isSharedRef,
    setIsShared,
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
