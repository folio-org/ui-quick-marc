import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const [instance, setInstance] = useState(null);
  const [marcRecord, setMarcRecord] = useState(null);
  const [selectedSourceFile, setSelectedSourceFile] = useState(null);
  const [_relatedRecordVersion, setRelatedRecordVersion] = useState();
  const validationErrors = useRef({});
  const continueAfterSave = useRef(false);

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
