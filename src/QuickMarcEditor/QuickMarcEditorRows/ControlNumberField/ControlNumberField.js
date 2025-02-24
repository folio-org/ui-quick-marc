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
  Col,
  Loading,
  Row,
} from '@folio/stripes/components';

import { SourceFileSelect } from '../../SourceFileSelect';
import { ContentField } from '../ContentField';
import { ErrorMessages } from '../ErrorMessages';
import { SOURCES } from '../../../common/constants';
import { getContentSubfieldValue } from '../../utils';
import { useAuthorityFileNextHrid } from '../../../queries';
import { QuickMarcContext } from '../../../contexts';

const propTypes = {
  canSelectSourceFile: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  recordRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  fieldId: PropTypes.string.isRequired,
};

const ControlNumberField = ({
  id,
  name,
  recordRows,
  fieldId,
  canSelectSourceFile,
}) => {
  const intl = useIntl();
  const { input } = useField(name);
  const {
    selectedSourceFile,
    setSelectedSourceFile,
    validationErrorsRef,
  } = useContext(QuickMarcContext);
  const { getAuthorityFileNextHrid, isLoading: isLoadingHrid } = useAuthorityFileNextHrid();

  const errors = validationErrorsRef.current[fieldId];
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

    setSelectedSourceFile(sourceFile);
    handleChangeContent(content);
  }, [valueOf010$a, handleChangeContent, getAuthorityFileNextHrid, setSelectedSourceFile]);

  useEffect(() => {
    if (selectedSourceFile?.source === SOURCES.FOLIO) {
      handleChangeContent(valueOf010$a);
    }
  }, [selectedSourceFile, valueOf010$a, handleChangeContent]);

  return (
    <>
      {canSelectSourceFile && (
        <Row>
          <Col xs={4}>
            <SourceFileSelect
              onSourceFileSelect={handleSourceFileSelection}
            />
          </Col>
          {isLoadingHrid && <Loading data-testid="hridLoading" />}
        </Row>
      )}
      <Field
        component={ContentField}
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
        name={name}
        disabled
        data-testid={id}
        id={id}
        parse={v => v}
        error={errors && <ErrorMessages errors={errors} />}
        marginBottom0
      />
    </>
  );
};

ControlNumberField.propTypes = propTypes;

export { ControlNumberField };
