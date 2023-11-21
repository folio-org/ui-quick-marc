import {
  useCallback,
  useState,
  useMemo,
} from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { useStripes } from '@folio/stripes/core';
import { Button } from '@folio/stripes/components';

import { useAuthoritySourceFiles } from '../../queries';
import { SourceFileLookupModal } from './SourceFileLookupModal';

const propTypes = {
  onSourceFileSelect: PropTypes.func.isRequired,
};

const SourceFileLookup = ({
  onSourceFileSelect,
}) => {
  const stripes = useStripes();
  const intl = useIntl();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const tenantId = stripes.hasInterface('consortia') ? stripes.user.user?.consortium?.centralTenantId : null;
  const { sourceFiles } = useAuthoritySourceFiles({ tenantId });

  const openModal = useCallback(() => setIsModalOpen(true), [setIsModalOpen]);
  const closeModal = useCallback(() => setIsModalOpen(false), [setIsModalOpen]);

  const onCancelModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const onConfirmModal = useCallback((sourceFileId) => {
    const selectedSourceFile = sourceFiles.find(sourceFile => sourceFile.id === sourceFileId);

    onSourceFileSelect(selectedSourceFile);
    closeModal();
  }, [onSourceFileSelect, closeModal, sourceFiles]);

  const label = intl.formatMessage({ id: 'ui-quick-marc.sourceFileLookup' });
  const sourceFileOptions = useMemo(() => sourceFiles.map(sourceFile => ({
    label: sourceFile.name,
    value: sourceFile.id,
  })), [sourceFiles]);

  return (
    <>
      <Button
        key="searchButton"
        buttonStyle="link"
        marginBottom0
        onClick={openModal}
      >
        {label}
      </Button>
      <SourceFileLookupModal
        open={isModalOpen}
        sourceFileOptions={sourceFileOptions}
        onConfirm={onConfirmModal}
        onCancel={onCancelModal}
      />
    </>
  );
};

SourceFileLookup.propTypes = propTypes;

export { SourceFileLookup };
