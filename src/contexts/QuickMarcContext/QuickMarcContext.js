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

  const contextValue = useMemo(() => ({
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrors,
    setValidationErrors,
  }), [
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrors,
    setValidationErrors,
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
