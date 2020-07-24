import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { RECORD_STATUS_CURRENT } from './constants';

const messages = {
  'ui-quick-marc.record.status.current': RECORD_STATUS_CURRENT,
  'stripes-components.metaSection.recordLastUpdated': 'Update: {date} {time}',
};

const renderQuickMarcRecordInfo = () => (render(
  <IntlProvider locale="en" messages={messages}>
    <QuickMarcRecordInfo
      status={RECORD_STATUS_CURRENT}
      updateDate="2020-07-14T12:20:10.000"
    />
  </IntlProvider>,
));

describe('Given Quick Marc Record Info', () => {
  afterEach(cleanup);

  it('Than it should display record status', () => {
    const { getByText } = renderQuickMarcRecordInfo();

    expect(getByText(RECORD_STATUS_CURRENT)).toBeDefined();
  });

  it('Than it should display record updated date', () => {
    const { getByText } = renderQuickMarcRecordInfo();

    expect(getByText('7/14/2020', { exact: false })).toBeDefined();
    expect(getByText('12:20 PM', { exact: false })).toBeDefined();
  });
});
