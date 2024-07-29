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
};

const QuickMarcProvider = ({
  children,
}) => {
  const [selectedSourceFile, setSelectedSourceFile] = useState(null);
  const validationErrors = useRef({});
  const [modifiedSinceLastSubmit, setModifiedSinceLastSubmit] = useState(false);

  const setValidationErrors = useCallback((newValidationErrors) => {
    validationErrors.current = newValidationErrors;
  }, []);

  const contextValue = useMemo(() => ({
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrorsRef: validationErrors,
    setValidationErrors,
    modifiedSinceLastSubmit,
    setModifiedSinceLastSubmit,
  }), [
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrors,
    setValidationErrors,
    modifiedSinceLastSubmit,
    setModifiedSinceLastSubmit,
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
