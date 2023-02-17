import React from 'react';
import PropTypes from 'prop-types';

import {
  Pane,
  Paneset,
} from '@folio/stripes/components';

import MarcContent from './MarcContent';

const propTypes = {
  isPaneset: PropTypes.bool,
  lastMenu: PropTypes.node,
  marc: PropTypes.object.isRequired,
  marcTitle: PropTypes.node.isRequired,
  paneTitle: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  paneHeight: PropTypes.string,
  paneSub: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
  onClose: PropTypes.func.isRequired,
  paneWidth: PropTypes.string,
};

const QuickMarcView = ({
  paneTitle,
  paneSub,
  paneHeight,
  marcTitle,
  marc,
  onClose,
  paneWidth,
  lastMenu,
  isPaneset,
}) => {
  const renderContent = () => (
    <Pane
      paneTitle={paneTitle}
      paneSub={paneSub}
      defaultWidth={paneWidth}
      id="marc-view-pane"
      dismissible
      onClose={onClose}
      data-test-instance-marc
      data-testid="marc-view-pane"
      height={paneHeight}
      lastMenu={lastMenu}
    >
      <MarcContent
        marcTitle={marcTitle}
        marc={marc}
      />
    </Pane>
  );

  return isPaneset
    ? (
      <Paneset
        isRoot
        data-testid="qm-view-paneset"
      >
        {renderContent()}
      </Paneset>
    )
    : renderContent();
};

QuickMarcView.propTypes = propTypes;
QuickMarcView.defaultProps = {
  isPaneset: true,
  paneHeight: null,
};

export default QuickMarcView;
