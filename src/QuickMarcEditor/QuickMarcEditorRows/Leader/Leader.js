import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import { leaderConfig } from './leaderConfig';
import { MARC_TYPES } from '../../../common/constants';

const Leader = ({
  name,
  marcType,
  leaderField,
}) => {
  const intl = useIntl();
  const fields = leaderConfig[marcType].map(config => {
    const { allowedValues, name: boxName } = config;

    if (allowedValues) {
      const initialValue = leaderField.content[boxName];

      const options = allowedValues.map(allowedValue => {
        const label = intl.formatMessage({ id: `ui-quick-marc.leader.${allowedValue.name}` });

        return {
          label: `${allowedValue.code} - ${label}`,
          value: allowedValue.code,
        };
      });

      return {
        name: boxName,
        type: SUBFIELD_TYPES.SELECT,
        options,
        initialValue,
      };
    }

    return config;
  });

  return (
    <BytesField
      name={name}
      id="leader"
      config={{
        fields,
      }}
    />
  );
};

Leader.propTypes = {
  name: PropTypes.string.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  leaderField: PropTypes.object.isRequired,
};

export { Leader };
