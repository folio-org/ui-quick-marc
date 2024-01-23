import {
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {
  Field,
  useField,
} from 'react-final-form';
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
import { QuickMarcContext } from '../../../contexts';

const propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  marcType: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  recordRows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const ControlNumberField = ({
  id,
  name,
  marcType,
  action,
  recordRows,
}) => {
  const intl = useIntl();
  const { input } = useField(name);
  const {
    selectedSourceFile,
    onSetSelectedSourceFile,
  } = useContext(QuickMarcContext);
  const { getAuthorityFileNextHrid, isLoading: isLoadingHrid } = useAuthorityFileNextHrid();

  const handleChangeContent = input.onChange;

  const contentOf010Row = recordRows.find(row => row.tag === '010')?.content;
  const valueOf010$a = getContentSubfieldValue(contentOf010Row).$a?.[0];

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

    onSetSelectedSourceFile(sourceFile);
    handleChangeContent(content);
  }, [valueOf010$a, handleChangeContent, getAuthorityFileNextHrid, onSetSelectedSourceFile]);

  const canSelectSourceFile = marcType === MARC_TYPES.AUTHORITY && action === QUICK_MARC_ACTIONS.CREATE;

  useEffect(() => {
    if (selectedSourceFile?.source === SOURCES.FOLIO) {
      handleChangeContent(valueOf010$a);
    }
  }, [selectedSourceFile, valueOf010$a, handleChangeContent]);

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
