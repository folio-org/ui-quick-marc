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

  const contextValue = useMemo(() => ({
    selectedSourceFile,
    onSetSelectedSourceFile: setSelectedSourceFile,
  }), [
    selectedSourceFile,
    setSelectedSourceFile,
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
