import React from 'react';
import PropTypes from 'prop-types';

import {
  Pane,
  Paneset,
  Headline,
} from '@folio/stripes/components';

import MarcField from './MarcField';
import { isControlField } from './utils';

import styles from './QuickMarcView.css';

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
  const parsedContent = marc.parsedRecord.content;
  const parsedMarc = {
    leader: parsedContent.leader,
    fields: [
      ...parsedContent.fields.filter(isControlField),
      ...parsedContent.fields.filter(field => !isControlField(field)),
    ],
  };

  const showLinkIcon = marc.recordType === 'MARC_BIB';

  const optionalProps = {};

  if (lastMenu) {
    optionalProps.lastMenu = lastMenu;
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
      <section className={styles.marcWrapper}>
        <Headline
          size="large"
          margin="small"
          tag="h3"
        >
          {marcTitle}
        </Headline>

        <table className={styles.marc}>
          <tbody>
            <tr data-test-instance-marc-field>
              <td colSpan="4">
                {`LEADER ${parsedMarc.leader}`}
              </td>
            </tr>

            {
              parsedMarc.fields
                .map((field, idx) => (
                  <MarcField
                    field={field}
                    key={idx}
                    showLinkIcon={showLinkIcon}
                  />
                ))
            }
          </tbody>
        </table>
      </section>
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
