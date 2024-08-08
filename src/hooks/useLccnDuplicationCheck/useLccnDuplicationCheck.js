import {
  useCallback,
  useState,
} from 'react';

import { useOkapiKy } from '@folio/stripes/core';

import { useLccnDuplicateConfig } from '../../queries';
import { MARC_TYPES } from '../../common/constants';
import { getContentSubfieldValue } from '../../QuickMarcEditor/utils';
import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';

const useLccnDuplicationCheck = ({ marcType, id, action }) => {
  const ky = useOkapiKy();
  const { duplicateLccnCheckingEnabled } = useLccnDuplicateConfig({ marcType });
  const [isLoading, setIsLoading] = useState(false);

  const validateLccnDuplication = useCallback(async (marcRecords) => {
    const field010 = marcRecords.find(field => field.tag === '010');
    const { $a = [] } = getContentSubfieldValue(field010?.content);

    if (!duplicateLccnCheckingEnabled
      || !field010
      || !$a.filter(lccn => lccn).length
      || ![MARC_TYPES.BIB, MARC_TYPES.AUTHORITY].includes(marcType)) {
      return undefined;
    }

    const lccnQuery = $a
      .filter(lccn => lccn)
      .map(lccn => `lccn=="${lccn}"`)
      .join(' or ');

    // prevent retrieving a record with the same id to avoid getting the record we are validating.
    let idQuery = ` not id=="${id}"`;

    // Derive mode uses the derived record id during saving, so a record with that id must also be searched to avoid
    // duplication in 010 $a.
    if ([QUICK_MARC_ACTIONS.CREATE, QUICK_MARC_ACTIONS.DERIVE].includes(action)) {
      idQuery = '';
    }

    const searchParams = {
      limit: 1,
      query: `(${lccnQuery})${idQuery}`,
    };

    const requests = {
      [MARC_TYPES.BIB]: () => ky.get('search/instances', { searchParams }),
      [MARC_TYPES.AUTHORITY]: () => ky.get('search/authorities', { searchParams }),
    };

    const buildError = (messageId) => ({
      [field010.id]: [{ id: messageId }],
    });

    try {
      setIsLoading(true);

      const records = await requests[marcType]().json();
      const isLccnDuplicated = records?.authorities?.[0] || records?.instances?.[0];

      if (isLccnDuplicated) {
        return buildError('ui-quick-marc.record.error.010.lccnDuplicated');
      }
    } catch (e) {
      return buildError('ui-quick-marc.record.error.generic');
    } finally {
      setIsLoading(false);
    }

    return undefined;
  }, [marcType, ky, duplicateLccnCheckingEnabled, id, action]);

  return {
    validateLccnDuplication,
    isValidatingLccnDuplication: isLoading,
  };
};

export { useLccnDuplicationCheck };
