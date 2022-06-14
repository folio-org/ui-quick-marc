import React from 'react';
import { render, cleanup } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { RECORD_STATUS_CURRENT } from './constants';
import { MARC_TYPES } from '../../common/constants';

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: jest.fn(({ id, values }) => (
    <>
      <span>{id}</span>
      {values && <span>{Object.values(values).join(' ')}</span>}
    </>
  )),
}));

const renderQuickMarcRecordInfo = (props = {}) => render(
  <QuickMarcRecordInfo
    isEditAction
    status={RECORD_STATUS_CURRENT}
    updateDate="2020-07-14T12:20:10.000"
    updatedBy={{
      firstName: 'John',
      lastName: 'Doe',
      username: 'JohnDoe',
    }}
    {...props}
  />,
);

describe('Given Quick Marc Record Info', () => {
  afterEach(cleanup);

  it('should display record status', () => {
    const { getByText } = renderQuickMarcRecordInfo();

    expect(getByText('ui-quick-marc.record.status.current', { exact: false })).toBeDefined();
  });

  it('should display record updated date', () => {
    const { getByText } = renderQuickMarcRecordInfo();

    expect(getByText('ui-quick-marc.record.lastUpdated', { exact: false })).toBeDefined();
  });

  it('should display person who last edited', () => {
    const { getByText } = renderQuickMarcRecordInfo();

    expect(getByText('stripes-components.metaSection.source', { exact: false })).toBeDefined();
    expect(getByText('John, Doe', { exact: false })).toBeDefined();
  });

  describe('when marc type is authority', () => {
    it('should display corresponding marc title', () => {
      const { getByText } = renderQuickMarcRecordInfo({
        correspondingMarcTag: '130',
        marcType: MARC_TYPES.AUTHORITY,
      });

      expect(getByText('ui-quick-marc.record.headingType.130')).toBeDefined();
    });
  });

  describe('when firstName in updateBy is undefined', () => {
    it('should display only lastName', () => {
      const { getByText } = renderQuickMarcRecordInfo({
        updatedBy: {
          firstName: undefined,
          lastName: 'Doe',
          username: 'JohnDoe',
        },
      });

      expect(getByText('Doe')).toBeDefined();
    });
  });

  describe('when lastName in updateBy is undefined', () => {
    it('should display only firstName', () => {
      const { getByText } = renderQuickMarcRecordInfo({
        updatedBy: {
          firstName: 'John',
          lastName: undefined,
          username: 'JohnDoe',
        },
      });

      expect(getByText('John')).toBeDefined();
    });
  });

  describe('when firstName and lastName in updateBy are undefined ', () => {
    it('should display username', () => {
      const { getByText } = renderQuickMarcRecordInfo({
        updatedBy: {
          firstName: undefined,
          lastName: undefined,
          username: 'JohnDoe',
        },
      });

      expect(getByText('JohnDoe')).toBeDefined();
    });
  });
});
