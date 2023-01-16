import PropTypes from 'prop-types';

import { Headline } from '@folio/stripes/components';

import MarcField from '../MarcField';
import { isControlField } from '../utils';
import styles from './MarcContent.css';

const MarcContent = ({
  marcTitle,
  marc,
  isPrint,
}) => {
  const showLinkIcon = marc.recordType === 'MARC_BIB';
  const parsedContent = marc.parsedRecord.content;
  const parsedMarc = {
    leader: parsedContent.leader,
    fields: [
      ...parsedContent.fields.filter(isControlField),
      ...parsedContent.fields.filter(field => !isControlField(field)),
    ],
  };

  return (
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
          <tr>
            <td colSpan="4">
              {`LEADER ${parsedMarc.leader}`}
            </td>
          </tr>
          {parsedMarc.fields.map((field, idx) => (
            <MarcField
              isPrint={isPrint}
              field={field}
              key={idx}
              showLinkIcon={showLinkIcon}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
};

MarcContent.propTypes = {
  isPrint: PropTypes.bool,
  marcTitle: PropTypes.node.isRequired,
  marc: PropTypes.object.isRequired,
};

MarcContent.defaultProps = {
  isPrint: false,
};

export default MarcContent;
