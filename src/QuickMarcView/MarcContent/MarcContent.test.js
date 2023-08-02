import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';

import { runAxeTest } from '@folio/stripes-testing';

import Harness from '../../../test/jest/helpers/harness';

import MarcContent from './MarcContent';

jest.mock('../MarcField', () => jest.fn(() => <tr><td>MarcField</td></tr>));

const marc = {
  parsedRecord: {
    id: 'a178daf3-b10a-4ff9-a4bf-703a0091f043',
    content: {
      fields: [{
        '001': 'in00000000140',
      }, {
        '008': '120126r20122010nyu      b    001 0 eng  ',
      }],
      leader: '00331cam a2200085 a 4500',
    },
  },
  recordType: 'MARC_BIB',
};

const renderMarcContent = (props = {}) => render(
  <Harness>
    <MarcContent
      marcTitle={<>fakeMarkTitle</>}
      marc={marc}
      {...props}
    />
  </Harness>,
);

describe('Given MarcContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with no axe errors', async () => {
    const { container } = renderMarcContent();

    await runAxeTest({
      rootNode: container,
    });
  });

  it('should show the marc title', () => {
    const { getByText } = renderMarcContent();

    expect(getByText('fakeMarkTitle')).toBeVisible();
  });

  it('should display the content of the marc record', () => {
    const { getByText } = renderMarcContent();

    expect(getByText('LEADER 00331cam a2200085 a 4500')).toBeVisible();
  });

  it('should render list of marc fields', () => {
    const { getAllByText } = renderMarcContent();

    expect(getAllByText('MarcField').length).toBe(2);
  });
});
