import {
  useCallback,
  useState,
  useMemo,
} from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { Select } from '@folio/stripes/components';

import { useAuthoritySourceFiles } from '../../queries';

const propTypes = {
  onSourceFileSelect: PropTypes.func.isRequired,
};

const SourceFileSelect = ({
  onSourceFileSelect,
}) => {
  const intl = useIntl();
  const { sourceFiles } = useAuthoritySourceFiles({ searchParams: { selectable: true } });

  const [selectedSourceFileId, setSelectedSourceFileId] = useState('');

  const handleSourceFileChange = useCallback((e) => {
    const sourceFileId = e.target.value;
    const sourceFile = sourceFiles.find(({ id }) => id === sourceFileId);

    onSourceFileSelect(sourceFile);
    setSelectedSourceFileId(sourceFileId);
  }, [onSourceFileSelect, sourceFiles]);

  const sourceFileOptions = useMemo(() => sourceFiles.map(sourceFile => ({
    label: sourceFile.name,
    value: sourceFile.id,
  })), [sourceFiles]);

  return (
    <>
      <Select
        aria-label={intl.formatMessage({ id: 'ui-quick-marc.sourceFileSelect.fieldLabel' })}
        placeholder={intl.formatMessage({ id: 'ui-quick-marc.sourceFileSelect.placeholder' })}
        marginBottom0
        value={selectedSourceFileId}
        dataOptions={sourceFileOptions}
        onChange={handleSourceFileChange}
      />
    </>
  );
};

SourceFileSelect.propTypes = propTypes;

export { SourceFileSelect };
