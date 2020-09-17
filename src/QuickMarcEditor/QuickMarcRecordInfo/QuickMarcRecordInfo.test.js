import React from 'react';
import { render, cleanup } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { RECORD_STATUS_CURRENT } from './constants';

const renderQuickMarcRecordInfo = () => (render(
  <QuickMarcRecordInfo
    status={RECORD_STATUS_CURRENT}
    updateDate="2020-07-14T12:20:10.000"
  />,
));

describe('Given Quick Marc Record Info', () => {
  afterEach(cleanup);

  it('Than it should display record status', () => {
    const { getByText } = renderQuickMarcRecordInfo();

    expect(getByText('ui-quick-marc.record.status.current')).toBeDefined();
  });

  it('Than it should display record updated date', () => {
    const { getByText } = renderQuickMarcRecordInfo();

    expect(getByText('stripes-components.metaSection.recordLastUpdated', { exact: false })).toBeDefined();
  });
});
