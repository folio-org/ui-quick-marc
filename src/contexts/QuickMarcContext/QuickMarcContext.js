import {
  createContext,
  useMemo,
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
  const [validationErrors, setValidationErrors] = useState({});
  const [modifiedSinceLastSubmit, setModifiedSinceLastSubmit] = useState(false);

  const contextValue = useMemo(() => ({
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrors,
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
