import React, { useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PropTypes from 'prop-types';

import MarcContent from '../MarcContent';
import styles from './PrintPopup.css';

const PrintPopup = ({
  marc,
  paneTitle,
  marcTitle,
  onAfterPrint,
}) => {
  const contentToPrintRef = useRef(null);

  const popupStyles = `
    @page {
      size: A4 auto;
      margin: 30px;
    }

    @media print {
      html, body {
        height: auto !important;
        overflow: initial !important;
        color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    pageStyle: popupStyles,
    onAfterPrint,
  });

  useEffect(() => {
    handlePrint();
  }, [handlePrint]);

  return (
    <div className={styles.hidden}>
      <div ref={contentToPrintRef} data-testid="print-popup">
        {paneTitle &&
        <>
          <h2 className={styles.paneTitle} data-testid="print-popup-title">
            <span>
              {paneTitle}
            </span>
          </h2>
          <hr />
        </>
        }
        <MarcContent
          isPrint
          marcTitle={marcTitle}
          marc={marc}
        />
      </div>
    </div>
  );
};

PrintPopup.propTypes = {
  marc: PropTypes.object.isRequired,
  marcTitle: PropTypes.node.isRequired,
  onAfterPrint: PropTypes.func.isRequired,
  paneTitle: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
};

export default PrintPopup;
