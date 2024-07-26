import { useCallback } from 'react';

import { useOkapiKy } from '@folio/stripes/core';

import { useLccnDuplicateConfig } from '../../queries';
import { MARC_TYPES } from '../../common/constants';
import { getContentSubfieldValue } from '../../QuickMarcEditor/utils';

const useLccnDuplicationCheck = ({ marcType }) => {
  const ky = useOkapiKy();
  const { duplicateLccnCheckingEnabled } = useLccnDuplicateConfig();

  const validateLccnDuplication = useCallback(async (formValues) => {
    const field010 = formValues.records.find(field => field.tag === '010');

    if (!duplicateLccnCheckingEnabled || !field010) return undefined;

    const { $a = [] } = getContentSubfieldValue(field010?.content);
    const lccnQuery = $a.map(value => `lccn=="${value}"`).join(' or ');

    const requests = {
      [MARC_TYPES.BIB]: () => ky.get(`search/instances?limit=1&query=(${lccnQuery} and source=="MARC")`),
      [MARC_TYPES.AUTHORITY]: () => ky.get(`search/authorities?limit=1&query=(${lccnQuery})`),
    };

    const recordsResponse = await requests[marcType]().json();
    const isLccnDuplicated = recordsResponse?.authorities?.[0] || recordsResponse?.instances?.[0];

    if (isLccnDuplicated) {
      return {
        [field010.id]: { id: 'ui-quick-marc.record.error.010.lccnDuplicated' },
      };
    }

    return undefined;
  }, [marcType, ky, duplicateLccnCheckingEnabled]);

  return {
    validateLccnDuplication,
  };
};

export { useLccnDuplicationCheck };
