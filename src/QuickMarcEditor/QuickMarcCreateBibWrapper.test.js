import React from 'react';
import {
  act,
  render,
  fireEvent,
} from '@testing-library/react';
import faker from 'faker';
import noop from 'lodash/noop';

import { runAxeTest } from '@folio/stripes-testing';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcCreateBibWrapper from './QuickMarcCreateBibWrapper';
import { MARC_TYPES } from '../common/constants';
import { QUICK_MARC_ACTIONS } from './constants';

import Harness from '../../test/jest/helpers/harness';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  FormSpy: jest.fn(() => (<span>FormSpy</span>)),
}));

const mockFormValues = jest.fn(() => ({
  'externalId': '00000000-0000-0000-0000-000000000000',
  'leader': '00000nu\\\\\\2200000un\\4500',
  'records': [
    {
      'tag': 'LDR',
      'content': '00000nai\\\\2200000un\\4500',
      'id': 'LDR',
    },
    {
      'tag': '001',
      'id': '6706b028-fa0e-4877-aa47-e79c90174a71',
      'content': '',
    },
    {
      'tag': '004',
      'id': '49af6f3d-9bfc-427d-bfa1-fb08c209af45',
    },
    {
      'tag': '005',
      'id': 'f1bfe5f1-c730-4cd1-bd0a-0f2c8c9537d0',
      'content': '',
    },
    {
      'tag': '006',
      'id': 'c81e4197-b742-4bbd-a7ef-d7d17b2f759e',
      'content': '\\',
    },
    {
      'tag': '007',
      'id': 'fef31f69-15cb-4705-8ee0-44f663f6ce7d',
      'content': '\\',
    },
    {
      'tag': '008',
      'id': '2a2d672f-f1c7-47ab-abad-a6f026466ce1',
      'content': {
        'AcqStatus': 0,
        'AcqMethod': 'u',
        'AcqEndDate': '\\\\\\\\',
        'Gen ret': 0,
        'Spec ret': [
          '\\',
          '\\',
          '\\',
        ],
        'Compl': 0,
        'Copies': '\\\\\\',
        'Lend': 'u',
        'Repro': 'u',
        'Lang': 'eng',
        'Sep/comp': 0,
        'Rept date': '\\\\\\\\\\\\',
      },
    },
    {
      'tag': '009',
      'id': '1091a566-dd47-4282-a67b-f1293a47e96d',
      'content': '$a ',
    },
    {
      'tag': '010',
      'id': '13990a70-4ce1-4a63-b9c4-8e9dee71e74c',
      'content': '2',
    },
    {
      'tag': '011',
      'id': '4205d0d2-c47f-4693-889d-476469517a8e',
      'content': '2',
    },
    {
      'tag': '017',
      'id': 'bc199797-5c86-40db-b25e-d9333863e462',
      'content': 'u',
    },
    {
      'tag': '018',
      'id': 'c4b77352-f663-4716-a20e-583a6a4edcfe',
      'content': 'u',
    },
    {
      'tag': '019',
      'id': 'fcf41674-17ab-400e-b80c-84a2784426e9',
      'content': '$a',
    },
    {
      'tag': '245',
      'id': '72c48376-afb3-44fe-8438-2af49fe1be15',
      'indicators': [
        '\\',
        '\\',
      ],
      'content': '$a ',
    },
    {
      'tag': '999',
      'id': '6eba49f4-30c6-4948-84cc-47741924c161',
      'indicators': [
        'f',
        'f',
      ],
      'content': '',
    },
  ],
  'parsedRecordDtoId': '00000000-0000-0000-0000-000000000000',
  'relatedRecordVersion': 1,
  'marcFormat': 'BIBLIOGRAPHIC',
  'updateInfo': {
    'recordState': 'NEW',
  },
}));

jest.mock('@folio/stripes/final-form', () => () => (Component) => ({ onSubmit, ...props }) => {
  const formValues = mockFormValues();

  return (
    <Component
      handleSubmit={() => onSubmit(formValues)}
      form={{
        mutators: {},
        reset: jest.fn(),
        getState: jest.fn().mockReturnValue({ values: formValues }),
      }}
      {...props}
    />
  );
});

const mockShowCallout = jest.fn();

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(() => mockShowCallout),
}));

jest.mock('./QuickMarcEditorRows', () => {
  return {
    QuickMarcEditorRows: () => (<span>QuickMarcEditorRows</span>),
  };
});

jest.mock('./QuickMarcRecordInfo', () => {
  return {
    QuickMarcRecordInfo: () => <span>QuickMarcRecordInfo</span>,
  };
});

jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  QM_RECORD_STATUS_TIMEOUT: 5,
  QM_RECORD_STATUS_BAIL_TIME: 20,
}));

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-inventory.instanceRecordTitle',
});

const record = {
  id: faker.random.uuid(),
  leader: faker.random.uuid(),
  fields: [],
};

const locations = [{
  code: 'KU/CC/DI/A',
}];

const renderQuickMarcCreateBibWrapper = ({
  instance,
  onClose = noop,
  mutator,
  history,
  location,
}) => (render(
  <Harness>
    <QuickMarcCreateBibWrapper
      onClose={onClose}
      instance={instance}
      mutator={mutator}
      action={QUICK_MARC_ACTIONS.CREATE_BIB}
      initialValues={{ leader: 'assdfgs ds sdg', records: [] }}
      history={history}
      location={location}
      marcType={MARC_TYPES.BIB}
      locations={locations}
    />
  </Harness>,
));

describe('Given QuickMarcCreateWrapper', () => {
  let mutator;
  let instance;
  let history;
  let location;

  beforeEach(() => {
    instance = getInstance();
    mutator = {
      quickMarcEditInstance: {
        GET: () => Promise.resolve(instance),
      },
      quickMarcEditMarcRecord: {
        GET: jest.fn(() => Promise.resolve(record)),
        POST: jest.fn(() => Promise.resolve({})),
      },
      quickMarcRecordStatus: {
        GET: jest.fn(() => Promise.resolve({})),
      },
    };
    history = {
      push: jest.fn(),
    };
    location = {
      search: '?filters=source.MARC',
    };
  });

  it('should render with no axe errors', async () => {
    const { container } = renderQuickMarcCreateBibWrapper({
      instance,
      mutator,
      history,
      location,
    });

    await runAxeTest({
      rootNode: container,
    });
  });

  describe('when click on cancel pane button', () => {
    const onClose = jest.fn();

    it('should handle onClose action', () => {
      const { getByText } = renderQuickMarcCreateBibWrapper({
        instance,
        mutator,
        history,
        onClose,
        location,
      });

      fireEvent.click(getByText('stripes-acq-components.FormFooter.cancel'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('when click on save button', () => {
    it('should show on save message and redirect on load page', async () => {
      let getByText;

      await act(async () => {
        getByText = renderQuickMarcCreateBibWrapper({
          instance,
          mutator,
          history,
          location,
        }).getByText;
      });

      await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.onSave' });

      await new Promise(resolve => {
        setTimeout(() => {
          expect(history.push).toHaveBeenCalledWith({
            pathname: '/inventory/view',
            search: location.search,
          });

          resolve();
        }, 10);
      });
    }, 100);
  });
});
