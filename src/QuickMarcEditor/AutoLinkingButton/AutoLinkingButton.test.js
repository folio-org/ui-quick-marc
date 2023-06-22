import React from 'react';
import {
  fireEvent,
  render,
} from '@testing-library/react';

import { useStripes } from '@folio/stripes/core';
import { runAxeTest } from '@folio/stripes-testing';

import { AutoLinkingButton } from './AutoLinkingButton';

import Harness from '../../../test/jest/helpers/harness';
import { useAuthorityLinking } from '../../hooks';
import { MARC_TYPES } from '../../common/constants';

const mockFetchLinkSuggestions = jest.fn();
const mockAutoLinkAuthority = jest.fn();
const mockMarkRecordsLinked = jest.fn();
const mockShowCallout = jest.fn();

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useStripes: jest.fn(),
  useNamespace: jest.fn().mockReturnValue(['ui-quick-marc-test']),
}));

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: () => mockShowCallout,
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useAuthorityLinking: jest.fn(),
}));

const renderComponent = (props = {}) => render(
  <Harness>
    <AutoLinkingButton
      marcType={MARC_TYPES.BIB}
      formValues={{ records: [] }}
      isLoadingLinkSuggestions={false}
      onMarkRecordsLinked={mockMarkRecordsLinked}
      onFetchLinkSuggestions={mockFetchLinkSuggestions}
      {...props}
    />
  </Harness>,
);

describe('Given AutoLinkingButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthorityLinking.mockReturnValue({
      autoLinkingEnabled: true,
      autoLinkableBibFields: ['100', '700'],
      autoLinkAuthority: mockAutoLinkAuthority,
    });
    useStripes.mockReturnValue({ hasPerm: () => true });
  });

  it('should render with no axe errors', async () => {
    const { container } = renderComponent();

    await runAxeTest({
      rootNode: container,
    });
  });

  describe('when there is no field for auto-linking enabled', () => {
    it('should not be displayed', () => {
      useAuthorityLinking.mockReturnValue({
        autoLinkingEnabled: false,
        autoLinkableBibFields: ['100'],
        autoLinkAuthority: mockAutoLinkAuthority,
      });

      const { queryByText } = renderComponent();

      expect(queryByText('ui-quick-marc.autoLinkingButton')).not.toBeInTheDocument();
    });
  });

  describe('when it is not a bib record', () => {
    it('should not be displayed', () => {
      const { queryByText } = renderComponent({
        marcType: MARC_TYPES.AUTHORITY,
      });

      expect(queryByText('ui-quick-marc.autoLinkingButton')).not.toBeInTheDocument();
    });
  });

  describe('when there is no permission', () => {
    it('should not be displayed', () => {
      useStripes.mockReturnValue({ hasPerm: () => false });

      const { queryByText } = renderComponent();

      expect(queryByText('ui-quick-marc.autoLinkingButton')).not.toBeInTheDocument();
    });
  });

  describe('when there is no field for auto-linking', () => {
    it('should be disabled', () => {
      const { getByTestId } = renderComponent({
        formValues: {
          records: [{
            tag: '100',
            content: '$a test',
            _isLinked: false,
            _isDeleted: false,
          }],
        },
      });

      expect(getByTestId('autoLinkingButton')).toBeDisabled();
    });
  });

  describe('when user clicks on the button', () => {
    it('should handle auto-linking', async () => {
      const formValues = {
        externalHrid: 'in00000000001',
        leader: '05274cam\\a2201021\\i\\4500',
        marcFormat: MARC_TYPES.BIB,
        records: [
          {
            'tag': 'LDR',
            'content': '05274cam\\a2201021\\i\\4500',
            'id': 'LDR',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi, $e author. $0 n2008001084',
            'indicators': ['1', '\\'],
            'isProtected': false,
            'id': '03b53478-16ba-49a3-bd4a-d6e1cf5e4104',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '336',
            'content': '$a still image $b sti $2 rdacontent',
            'indicators': ['\\', '\\'],
            'isProtected': false,
            'id': '2580b8bd-0eef-462f-8388-0ec4e2ede186',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '700',
            'content': '$a Stelfreeze, Brian, $e artist. $0 no2005093867',
            'indicators': ['1', '\\'],
            'isProtected': false,
            'id': '6402b2c5-c858-4ef0-ae68-c08884cc8d18',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '700',
            'content': '$a Sprouse, Chris, $e artist. $0 test2',
            'indicators': ['1', '\\'],
            'isProtected': false,
            'id': '0c686fe6-e747-43a9-88e8-b106be9f171e',
            '_isDeleted': false,
            '_isLinked': false,
          },
        ],
      };

      const payload = {
        leader: '05274cam\\a2201021\\i\\4500',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        fields: [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi, $e author. $0 n2008001084',
          },
          {
            'tag': '700',
            'content': '$a Stelfreeze, Brian, $e artist. $0 no2005093867',
          },
          {
            'tag': '700',
            'content': '$a Sprouse, Chris, $e artist. $0 test2',
          },
        ],
      };

      const data = {
        leader: '05274cam\\a2201021\\i\\4500',
        suppressDiscovery: false,
        _actionType: 'view',
        fields: [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 125ef84d-c372-4508-bf9b-08c7f2a0b02e',
            'linkDetails': {
              'authorityId': '125ef84d-c372-4508-bf9b-08c7f2a0b02e',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing $e artist. $0 id.loc.gov/authorities/names/no2005093867 $9 4fb6282f-771f-469b-b182-691432e6a45a',
            'linkDetails': {
              'authorityId': '4fb6282f-771f-469b-b182-691432e6a45a',
              'authorityNaturalId': 'no2005093867',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Sprouse, Chris, $e artist. $0 test2',
            'linkDetails': {
              'status': 'ERROR',
              'errorCause': '101',
            },
          },
        ],
      };

      const fields = [
        {
          'tag': '100',
          'content': '$a Coates, Ta-Nehisi, $e author. $0 n2008001084',
        },
        {
          'tag': '700',
          'content': '$a Stelfreeze, Brian, $e artist. $0 no2005093867',
        },
        {
          'tag': '700',
          'content': '$a Sprouse, Chris, $e artist. $0 test2',
        },
      ];

      const toasts = [
        {
          'messageId': 'ui-quick-marc.records.autoLink.linkedFields',
          'values': {
            'count': 2,
            'fieldTags': '100',
            'lastFieldTag': '700',
          },
        },
        {
          'type': 'error',
          'messageId': 'ui-quick-marc.records.autoLink.notLinkedFields',
          'values': {
            'count': 1,
            'fieldTags': '700',
            'lastFieldTag': '700',
          },
        },
      ];

      mockFetchLinkSuggestions.mockResolvedValue(data);
      mockAutoLinkAuthority.mockReturnValue(fields);

      const { getByTestId } = renderComponent({ formValues });

      fireEvent.click(getByTestId('autoLinkingButton'));

      await expect(mockFetchLinkSuggestions).toHaveBeenCalledWith(payload);
      expect(mockAutoLinkAuthority).toHaveBeenCalledWith(formValues.records, data.fields);
      expect(mockMarkRecordsLinked).toHaveBeenCalledWith({ fields });
      expect(mockShowCallout).toHaveBeenCalledTimes(2);
      expect(mockShowCallout).toHaveBeenNthCalledWith(1, toasts[0]);
      expect(mockShowCallout).toHaveBeenNthCalledWith(2, toasts[1]);
    });
  });
});
