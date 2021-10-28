import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  act,
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import faker from 'faker';
import noop from 'lodash/noop';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcCreateWrapper from './QuickMarcCreateWrapper';
import { MARC_TYPES } from '../common/constants';
import { QUICK_MARC_ACTIONS } from './constants';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  FormSpy: jest.fn(() => (<span>FormSpy</span>)),
}));

const mockFormValues = jest.fn(() => ({
  fields: undefined,
  externalHrid: 'in00000000022',
  externalId: '17064f9d-0362-468d-8317-5984b7efd1b5',
  leader: '00000nu\\\\\\2200000un\\4500',
  marcFormat: 'HOLDINGS',
  parsedRecordDtoId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  parsedRecordId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  records: [
    {
      tag: 'LDR',
      content: '00000nu\\\\\\2200000un\\4500',
      id: 'LDR',
    }, {
      tag: '001',
      id: '595a98e6-8e59-448d-b866-cd039b990423',
    }, {
      tag: '004',
      content: 'in00000000022',
      id: '93213747-46fb-4861-b8e8-8774bf4a46a4',
    }, {
      tag: '852',
      content: '$b KU/CC/DI/A$t3$hM3$i.M93 1955$m+$xRec\'d in Music Lib ;',
      indicators: ['0', '1'],
      id: '6abdaf9b-ac58-4f83-9687-73c939c3c21a',
    }, {
      tag: '014',
      content: '$a ABS3966CU004',
      indicators: ['1', '\\'],
      id: '5aa1a643-b9f2-47e8-bb68-6c6457b5c9c5',
    }, {
      tag: '005',
      id: '5aa1a643-b9f2-47e8-bb68-6c6457b5c9c5',
    }, {
      tag: '999',
      indicators: ['f', 'f'],
      id: '4a844042-5c7e-4e71-823e-599582a5d7ab',
    },
  ],
  relatedRecordVersion: 1,
  suppressDiscovery: false,
  updateInfo: { recordState: 'NEW' },
}));

jest.mock('@folio/stripes/final-form', () => () => (Component) => ({ onSubmit, ...props }) => {
  const formValues = mockFormValues();

  return (
    <Component
      handleSubmit={() => onSubmit(formValues)}
      form={{
        mutators: {},
        reset: jest.fn(),
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

const renderQuickMarcCreateWrapper = ({
  instance,
  onClose = noop,
  mutator,
  history,
  location,
}) => (render(
  <MemoryRouter>
    <QuickMarcCreateWrapper
      onClose={onClose}
      instance={instance}
      mutator={mutator}
      action={QUICK_MARC_ACTIONS.CREATE}
      initialValues={{ leader: 'assdfgs ds sdg' }}
      history={history}
      location={location}
      marcType={MARC_TYPES.HOLDINGS}
    />
  </MemoryRouter>,
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

  afterEach(cleanup);

  describe('when click on cancel pane button', () => {
    const onClose = jest.fn();

    it('should handle onClose action', () => {
      const { getByText } = renderQuickMarcCreateWrapper({
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
        getByText = renderQuickMarcCreateWrapper({
          instance,
          mutator,
          history,
          location,
        }).getByText;
      });

      await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });
    }, 100);

    describe('when form is valid and status is created', () => {
      it('should show success toast notification', async () => {
        let getByText;
        const externalId = faker.random.uuid();

        mutator.quickMarcRecordStatus.GET = jest.fn(() => Promise.resolve({
          externalId,
          jobExecutionId: faker.random.uuid(),
          status: 'CREATED',
        }));

        await act(async () => {
          getByText = renderQuickMarcCreateWrapper({
            instance,
            mutator,
            history,
            location,
          }).getByText;
        });

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mutator.quickMarcRecordStatus.GET).toHaveBeenCalled();
            expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.success' });

            resolve();
          }, 10);
        });
      }, 100);
    });

    describe('when form is valid and status is error', () => {
      it('should show error toast notification', async () => {
        let getByText;

        mutator.quickMarcRecordStatus.GET = jest.fn(() => Promise.resolve({
          externalId: null,
          jobExecutionId: faker.random.uuid(),
          status: 'ERROR',
        }));

        await act(async () => {
          getByText = renderQuickMarcCreateWrapper({
            instance,
            mutator,
            history,
            location,
          }).getByText;
        });

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mutator.quickMarcRecordStatus.GET).toHaveBeenCalled();
            expect(mockShowCallout).toHaveBeenCalledWith({
              messageId: 'ui-quick-marc.record.saveNew.error',
              type: 'error',
            });

            resolve();
          }, 10);
        });
      }, 100);
    });

    describe('when form is valid and fetch is failed', () => {
      it('should show error toast notification', async () => {
        let getByText;

        mutator.quickMarcRecordStatus.GET = jest.fn(() => Promise.reject());

        await act(async () => {
          getByText = renderQuickMarcCreateWrapper({
            instance,
            mutator,
            history,
            location,
          }).getByText;
        });

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mutator.quickMarcRecordStatus.GET).toHaveBeenCalled();
            expect(mockShowCallout).toHaveBeenCalledWith({
              messageId: 'ui-quick-marc.record.saveNew.error',
              type: 'error',
            });

            resolve();
          }, 10);
        });
      }, 100);
    });

    describe('when form is valid and status is in progress more than 20 seconds', () => {
      it('should show toast notification with delay message', async () => {
        let getByText;

        mutator.quickMarcRecordStatus.GET = jest.fn(() => Promise.resolve({
          externalId: null,
          jobExecutionId: faker.random.uuid(),
          status: 'IN_PROGRESS',
        }));

        await act(async () => {
          getByText = renderQuickMarcCreateWrapper({
            instance,
            mutator,
            history,
            location,
          }).getByText;
        });

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalled();

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.delay' });

            resolve();
          }, 40);
        });
      }, 100);
    });

    describe('when there is an error during POST request', () => {
      it('should show an error message', async () => {
        let getByText;

        await act(async () => {
          getByText = renderQuickMarcCreateWrapper({
            instance,
            mutator,
            history,
            location,
          }).getByText;
        });

        mutator.quickMarcEditMarcRecord.POST = jest.fn(() => Promise.reject());

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalled();

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mockShowCallout).toHaveBeenCalledWith({
              messageId: 'ui-quick-marc.record.save.error.generic',
              type: 'error',
            });

            resolve();
          }, 10);
        });
      }, 100);
    });
  });
});
