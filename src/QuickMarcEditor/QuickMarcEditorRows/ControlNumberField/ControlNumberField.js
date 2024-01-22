import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Layout,
  Loading,
} from '@folio/stripes/components';

import { SourceFileLookup } from '../../SourceFileLookup';
import { ContentField } from '../ContentField';
import {
  MARC_TYPES,
  SOURCES,
} from '../../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../constants';
import { getContentSubfieldValue } from '../../utils';
import { useAuthorityFileNextHrid } from '../../../queries';

const propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  marcType: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  recordRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChangeControlNumberRecord: PropTypes.func.isRequired,
};

const ControlNumberField = ({
  id,
  name,
  marcType,
  action,
  recordRows,
  onChangeControlNumberRecord,
}) => {
  const intl = useIntl();
  const { getAuthorityFileNextHrid, isLoading: isLoadingHrid } = useAuthorityFileNextHrid();

  const [selectedSource, setSelectedSource] = useState('');

  const contentOf010Row = recordRows.find(row => row.tag === '010')?.content;
  const valueOf010$a = getContentSubfieldValue(contentOf010Row).$a?.[0];

  const controlNumberIndex = recordRows.findIndex(row => row.tag === '001');

  const handleChangeControlNumberRecord = useCallback((content, sourceFile) => {
    const controlNumberRow = recordRows[controlNumberIndex];

    onChangeControlNumberRecord({
      index: controlNumberIndex,
      field: {
        ...controlNumberRow,
        content,
      },
      sourceFile: sourceFile || controlNumberRow._sourceFile,
    });
  }, [onChangeControlNumberRecord, controlNumberIndex, recordRows]);

  const handleSourceFileSelection = useCallback(async (sourceFile) => {
    const {
      id: sourceFileId,
      source,
    } = sourceFile;

    let content;

    if (source === SOURCES.LOCAL) {
      const { hrid } = await getAuthorityFileNextHrid(sourceFileId);

      content = hrid;
    } else if (source === SOURCES.FOLIO) {
      content = valueOf010$a;
    }

    setSelectedSource(source);
    handleChangeControlNumberRecord(content, sourceFile);
  }, [valueOf010$a, getAuthorityFileNextHrid, handleChangeControlNumberRecord]);

  const canSelectSourceFile = marcType === MARC_TYPES.AUTHORITY && action === QUICK_MARC_ACTIONS.CREATE;

  useEffect(() => {
    if (selectedSource === SOURCES.FOLIO) {
      handleChangeControlNumberRecord(valueOf010$a);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [valueOf010$a]);

  return (
    <>
      <Field
        component={ContentField}
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
        name={name}
        disabled
        data-testid={id}
        id={id}
        parse={v => v}
      />
      {canSelectSourceFile && (
        <Layout className="display-flex">
          <SourceFileLookup
            disabled={isLoadingHrid}
            onSourceFileSelect={handleSourceFileSelection}
          />
          {isLoadingHrid && <Loading data-testid="hridLoading" />}
        </Layout>
      )}
    </>
  );
};

ControlNumberField.propTypes = propTypes;

export { ControlNumberField };
