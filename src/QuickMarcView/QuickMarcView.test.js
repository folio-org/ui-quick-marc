import React from 'react';
import {
  render,
} from '@testing-library/react';

import QuickMarcView from './QuickMarcView';

const marc = {
  parsedRecord: {
    id: 'a178daf3-b10a-4ff9-a4bf-703a0091f043',
    content: {
      fields: [{
        '001': 'in00000000140',
      }, {
        '008': '120126r20122010nyu      b    001 0 eng  ',
      }, {
        '005': '20211207090250.8',
      }, {
        '245': {
          'ind1': '1',
          'ind2': '0',
          subfields: [{
            a: 'Across the line of control :',
          }, {
            b: 'inside Pakistan-administered Jammu and Kashmir /',
          }, {
            b: 'Luv Puri.',
          }],
        },
      }, {
        '999': {
          ind1: 'f',
          ind2: 'f',
          subfields: [{
            s: '225f733f-8231-4d48-b104-a9c56d675eec',
          }, {
            i: '225f733f-8231-4d48-b104-a9c56d675eec',
          }],
        },
      }],
      leader: '00331cam a2200085 a 4500',
    },
  },
};

const mockOnClose = jest.fn();

const renderQuickMarcView = (props = {}) => (render(
  <QuickMarcView
    paneTitle="Pane title"
    paneSub="Pane sub"
    marcTitle="MARC title"
    marc={marc}
    onClose={mockOnClose}
    {...props}
  />,
));

describe('Given QuickMarcView', () => {
  it('should show pane title', () => {
    const { getByText } = renderQuickMarcView();

    expect(getByText('Pane title')).toBeDefined();
  });

  it('should show pane sub', () => {
    const { getByText } = renderQuickMarcView();

    expect(getByText('Pane sub')).toBeDefined();
  });

  it('should show MARC title', () => {
    const { getByText } = renderQuickMarcView();

    expect(getByText('MARC title')).toBeDefined();
  });

  it('should show MARC leader', () => {
    const { getByText } = renderQuickMarcView();

    expect(getByText(`LEADER ${marc.parsedRecord.content.leader}`)).toBeDefined();
  });
});
