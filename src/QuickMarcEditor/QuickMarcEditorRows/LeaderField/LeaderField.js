import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import { leaderConfig } from './leaderConfig';
import { MARC_TYPES } from '../../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../constants';

const LeaderField = ({
  name,
  marcType,
  leaderField,
  action,
}) => {
  const intl = useIntl();
  const fields = leaderConfig[marcType].map(config => {
    const { allowedValues, name: boxName } = config;
    const required = marcType === MARC_TYPES.BIB && action === QUICK_MARC_ACTIONS.CREATE && ['Type', 'BLvl'].includes(boxName);

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
        required,
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

LeaderField.propTypes = {
  action: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  leaderField: PropTypes.object.isRequired,
};

export { LeaderField };
