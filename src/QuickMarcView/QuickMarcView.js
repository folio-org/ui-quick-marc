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
  lastMenu: PropTypes.node,
  marc: PropTypes.object.isRequired,
  marcTitle: PropTypes.node.isRequired,
  paneTitle: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
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
  marcTitle,
  marc,
  onClose,
  paneWidth,
  lastMenu,
}) => {
  const parsedContent = marc.parsedRecord.content;
  const parsedMarc = {
    leader: parsedContent.leader,
    fields: [
      ...parsedContent.fields.filter(isControlField),
      ...parsedContent.fields.filter(field => !isControlField(field)),
    ],
  };

  const optionalProps = {};

  if (lastMenu) {
    optionalProps.lastMenu = lastMenu;
  }

  return (
    <Paneset isRoot>
      <Pane
        paneTitle={paneTitle}
        paneSub={paneSub}
        defaultWidth={paneWidth}
        id="marc-view-pane"
        dismissible
        onClose={onClose}
        data-test-instance-marc
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
                    />
                  ))
              }
            </tbody>
          </table>
        </section>
      </Pane>
    </Paneset>
  );
};

QuickMarcView.propTypes = propTypes;

export default QuickMarcView;
