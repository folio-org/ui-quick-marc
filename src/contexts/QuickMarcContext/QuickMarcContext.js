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
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  relatedRecordVersion: PropTypes.number,
};

const QuickMarcProvider = ({
  children,
  relatedRecordVersion,
}) => {
  const [selectedSourceFile, setSelectedSourceFile] = useState(null);
  const [_relatedRecordVersion, setRelatedRecordVersion] = useState(relatedRecordVersion);
  const validationErrors = useRef({});

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
  }), [
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrors,
    setValidationErrors,
    _relatedRecordVersion,
    setRelatedRecordVersion,
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
