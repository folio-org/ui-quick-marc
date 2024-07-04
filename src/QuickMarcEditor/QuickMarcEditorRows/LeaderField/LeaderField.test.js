import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { render, within } from '@folio/jest-config-stripes/testing-library/react';

import Harness from '../../../../test/jest/helpers/harness';
import { bibLeader } from '../../../../test/jest/fixtures/leaders';
import { LeaderField } from './LeaderField';
import { QUICK_MARC_ACTIONS } from '../../constants';
import { MARC_TYPES } from '../../../common/constants';

const renderLeaderField = (props = {}) => render(
  <Harness>
    <Form
      onSubmit={jest.fn()}
      mutators={{ ...arrayMutators }}
      render={() => (
        <LeaderField
          name="records[0].content"
          marcType={MARC_TYPES.BIB}
          action={QUICK_MARC_ACTIONS.EDIT}
          leaderField={bibLeader}
          {...props}
        />
      )}
    />
  </Harness>,
);

describe('Given LeaderField', () => {
  describe('when creating a Bib record', () => {
    it('should display an asterisk next to the "Type" and "BLvl" fields', () => {
      const leaderField = {
        tag: 'LDR',
        content: {
          'Record length': '00000',
          'Status': 'n',
          'Type': '\\',
          'BLvl': '\\',
          'Ctrl': '\\',
          '9-16 positions': 'a2200000',
          'ELvl': 'u',
          'Desc': 'u',
          'MultiLvl': '\\',
          '20-23 positions': '4500',
        },
        id: 'LDR',
      };

      const { getAllByText } = renderLeaderField({
        action: QUICK_MARC_ACTIONS.CREATE,
        leaderField,
      });

      const typeField = getAllByText('ui-quick-marc.record.fixedField.Type')[0];
      const blvlField = getAllByText('ui-quick-marc.record.fixedField.BLvl')[0];

      expect(within(typeField).getByText('*')).toBeVisible();
      expect(within(blvlField).getByText('*')).toBeVisible();
    });
  });
});
