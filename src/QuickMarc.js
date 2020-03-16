import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
} from 'react-router-dom';

const QuickMarcEditor = () => (
  <div>
    QuickMarc
  </div>
);

const QuickMarc = ({ baseRoute }) => {
  return (
    <div data-test-quick-marc>
      <Switch>
        <Route
          component={QuickMarcEditor}
          path={`${baseRoute}/quick-marc`}
        />
      </Switch>
    </div>
  );
};

QuickMarc.propTypes = {
  baseRoute: PropTypes.string.isRequired,
};

export default QuickMarc;
