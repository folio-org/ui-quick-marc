import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import {
  PaneMenu,
  Pane,
  Paneset,
  Button,
} from '@folio/stripes/components';

import MarcContent from './MarcContent';
import PrintPopup from './PrintPopup';

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
  const [showPrintPopup, setShowPrintPopup] = useState(false);

  const isMarcBibRecord = marc.recordType === 'MARC_BIB';

  const openPrintPopup = () => {
    setShowPrintPopup(true);
  };

  const closePrintPopup = () => {
    setShowPrintPopup(false);
  };

  const renderPrintButton = () => (
    <IfPermission perm="ui-quick-marc.quick-marc-editor.view">
      <Button
        marginBottom0
        buttonStyle="primary"
        onClick={openPrintPopup}
      >
        <FormattedMessage id="ui-quick-marc.print" />
      </Button>
    </IfPermission>
  );

  const optionalProps = {};

  if (isMarcBibRecord && !lastMenu) {
    optionalProps.lastMenu = renderPrintButton();
  }

  if (lastMenu) {
    optionalProps.lastMenu = (
      <PaneMenu>
        {lastMenu}
        {isMarcBibRecord && renderPrintButton()}
      </PaneMenu>
    );
  }

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
      {...optionalProps}
    >
      <MarcContent
        marcTitle={marcTitle}
        marc={marc}
      />
      {showPrintPopup && (
        <PrintPopup
          marc={marc}
          paneTitle={paneTitle}
          marcTitle={marcTitle}
          onAfterPrint={closePrintPopup}
        />
      )}
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
