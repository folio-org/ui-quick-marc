import PropTypes from 'prop-types';
import flatten from 'lodash/flatten';

import { IconButton } from '@folio/stripes/components';
import {
  ADVANCED_SEARCH_INDEX,
  advancedSearchQueryBuilder,
} from '@folio/stripes-inventory-components';

import { getContentSubfieldValue } from '../../utils';
import { MARC_TYPES } from '../../../common/constants';

const propTypes = {
  field: PropTypes.shape({
    content: PropTypes.string.isRequired,
  }).isRequired,
  marcType: PropTypes.string.isRequired,
};

const SearchLink = ({ field, marcType }) => {
  const content = getContentSubfieldValue(field.content);

  const numberOfAdvancedSearchRows = 6;
  // we search by field's $a and $z values
  const valuesToSearchBy = flatten([content.$a, content.$z]).slice(0, numberOfAdvancedSearchRows);

  const advancedSearchRows = valuesToSearchBy.filter(value => Boolean(value)).map(value => ({
    bool: 'or',
    query: value,
    match: 'exactPhrase',
    searchOption: 'lccn',
  }));

  const builtQuery = advancedSearchQueryBuilder(advancedSearchRows);

  const searchParams = new URLSearchParams({
    qindex: ADVANCED_SEARCH_INDEX,
    query: builtQuery,
  });

  const app = marcType === MARC_TYPES.AUTHORITY ? 'marc-authorities' : 'inventory';

  const link = `/${app}?${searchParams.toString()}`;

  return (
    <IconButton
      icon="search"
      to={link}
      target="_blank"
    />
  );
};

SearchLink.propTypes = propTypes;

export { SearchLink };
