import React from 'react';

import {
  act,
  fireEvent,
  render,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  checkIfUserInMemberTenant,
  checkIfUserInCentralTenant,
  Pluggable,
  useOkapiKy,
} from '@folio/stripes/core';
import { ADVANCED_SEARCH_MATCH_OPTIONS } from '@folio/stripes/components';
import { runAxeTest } from '@folio/stripes-testing';

import { useIsShared } from '../../../hooks';
import { LinkButton } from './LinkButton';
import { QUICK_MARC_ACTIONS } from '../../constants';

import Harness from '../../../../test/jest/helpers/harness';

jest.mock('@folio/stripes-marc-components', () => ({
  ...jest.requireActual('@folio/stripes-marc-components'),
  useAuthorityLinkingRules: jest.fn().mockReturnValue({
    linkingRules: [{
      bibField: '100',
      authoritySubfields: ['a', 'd'],
    }],
  }),
}));

jest.mock('../../../hooks', () => ({
  useIsShared: jest.fn().mockReturnValue({
    isShared: false,
    getIsShared: () => false,
    setIsShared: jest.fn(),
  }),
}));

const { EXACT_PHRASE } = ADVANCED_SEARCH_MATCH_OPTIONS;

const mockOnClick = jest.fn();
const mockGetMarcSource = jest.fn(() => ({ json: () => {} }));

const mockHandleLinkAuthority = jest.fn();
const mockHandleUnlinkAuthority = jest.fn();

const renderComponent = (props = {}) => render(
  <Harness quickMarcContext={props.quickMarcContext}>
    <LinkButton
      action={QUICK_MARC_ACTIONS.EDIT}
      handleLinkAuthority={mockHandleLinkAuthority}
      handleUnlinkAuthority={mockHandleUnlinkAuthority}
      isLinked={false}
      isLoading={false}
      fieldId="fakeId"
      tag="100"
      content=""
      {...props}
    />
  </Harness>,
);

describe('Given LinkButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOkapiKy.mockReturnValue(({
      get: mockGetMarcSource,
      extend: jest.fn(),
    }));
    Pluggable.mockImplementation(({ renderCustomTrigger }) => renderCustomTrigger({ onClick: mockOnClick }));
    checkIfUserInMemberTenant.mockReturnValue(false);
    checkIfUserInCentralTenant.mockReturnValue(false);
  });

  it('should render with no axe errors', async () => {
    const { container } = renderComponent();

    await runAxeTest({
      rootNode: container,
    });
  });

  describe('when field is unlinked', () => {
    it('should render link button', () => {
      const { getAllByTestId } = renderComponent();

      expect(getAllByTestId('link-authority-button-fakeId')).toBeDefined();
    });
  });

  describe('when clicking on link button', () => {
    it('should call onClick', () => {
      const { getAllByTestId } = renderComponent();

      fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

      expect(mockOnClick).toHaveBeenCalled();
    });

    describe('and the selected authority record is the same as the one previously selected', () => {
      it('should refetch marc source', async () => {
        renderComponent();

        const authority = {
          id: 'authority-id',
        };

        mockGetMarcSource.mockClear(); // clear linking rules call
        await act(async () => { Pluggable.mock.calls[0][0].onLinkRecord(authority); });
        act(() => { Pluggable.mock.calls[1][0].onLinkRecord(authority); });

        expect(mockGetMarcSource).toHaveBeenCalledTimes(2);
      });
    });

    describe('when linking Authority to empty field', () => {
      it('should pass initial values to plugin', async () => {
        const { getAllByTestId } = renderComponent();

        const initialValues = {
          search: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: null,
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: null,
          },
          segment: 'browse',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });

    describe('when linking Authority and field content contains "{dollar}"', () => {
      it('should be replaced with $ sign for search input and search query', () => {
        const { getAllByTestId } = renderComponent({
          content: '$a {dollar}{dollar}{dollar} 50.00{dollar} $d currency ({dollar}) $0 n123456789 $t test{dollar}',
        });

        const searchInputValue = `keyword ${EXACT_PHRASE} $$$ 50.00$ currency ($) or identifiers.value ${EXACT_PHRASE} n123456789`;

        const initialValues = {
          search: {
            dropdownValue: 'advancedSearch',
            searchIndex: 'advancedSearch',
            searchInputValue,
            searchQuery: searchInputValue,
            filters: null,
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: null,
          },
          segment: 'search',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });

    describe('when linking Authority', () => {
      it('should use all controlled subfields for search', () => {
        const { getAllByTestId } = renderComponent({
          content: '$a test1 $d test2 $0 n123456789 $t test3',
        });

        const searchInputValue = `keyword ${EXACT_PHRASE} test1 test2 or identifiers.value ${EXACT_PHRASE} n123456789`;

        const initialValues = {
          search: {
            dropdownValue: 'advancedSearch',
            searchIndex: 'advancedSearch',
            searchInputValue,
            searchQuery: searchInputValue,
            filters: null,
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: null,
          },
          segment: 'search',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });

    describe('when linking Authority to a field with $0', () => {
      it('should pass initial values to plugin', async () => {
        const { getAllByTestId } = renderComponent({
          content: '$0 n123456789',
        });

        const initialValues = {
          search: {
            dropdownValue: 'advancedSearch',
            searchIndex: 'advancedSearch',
            searchInputValue: `identifiers.value ${EXACT_PHRASE} n123456789`,
            searchQuery: `identifiers.value ${EXACT_PHRASE} n123456789`,
            filters: null,
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: null,
          },
          segment: 'search',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });

    describe('when linking Authority to a field with multiple $0', () => {
      it('should pass initial values to plugin', async () => {
        const { getAllByTestId } = renderComponent({
          content: '$0 n123456789 $0 n987654321',
        });

        const initialValues = {
          search: {
            dropdownValue: 'advancedSearch',
            searchIndex: 'advancedSearch',
            searchInputValue: `identifiers.value ${EXACT_PHRASE} n123456789 or identifiers.value ${EXACT_PHRASE} n987654321`,
            searchQuery: `identifiers.value ${EXACT_PHRASE} n123456789 or identifiers.value ${EXACT_PHRASE} n987654321`,
            filters: null,
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: null,
          },
          segment: 'search',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });
  });

  describe('when field is linked', () => {
    it('should render link button', () => {
      const { getAllByTestId } = renderComponent({
        isLinked: true,
      });

      expect(getAllByTestId('unlink-authority-button-fakeId')).toBeDefined();
    });
  });

  describe('when clicking on unlink button', () => {
    it('should show confirmation modal', () => {
      const {
        getAllByTestId,
        getByText,
      } = renderComponent({
        isLinked: true,
      });

      fireEvent.click(getAllByTestId('unlink-authority-button-fakeId')[0]);

      expect(getByText('ui-quick-marc.record.unlink.confirm.title')).toBeDefined();
    });
  });

  describe('when confirming unlinking', () => {
    it('should call handleUnlinkAuthority', () => {
      const {
        getAllByTestId,
        getByText,
      } = renderComponent({
        isLinked: true,
      });

      fireEvent.click(getAllByTestId('unlink-authority-button-fakeId')[0]);
      fireEvent.click(getByText('confirm'));

      expect(mockHandleUnlinkAuthority).toHaveBeenCalled();
    });
  });

  describe('when isLoading is true', () => {
    it('should not be displayed', () => {
      const { queryAllByTestId } = renderComponent({ isLoading: true });

      expect(queryAllByTestId('link-authority-button-fakeId')[0]).toBeUndefined();
    });
  });

  describe('when member tenant edits a shared bib record', () => {
    beforeEach(() => {
      useIsShared.mockClear().mockReturnValue({
        isShared: true,
      });
    });

    it('should pass correct props', () => {
      checkIfUserInMemberTenant.mockReturnValue(true);

      const centralTenantId = 'consortia';
      const initialValues = expect.objectContaining({
        browse: expect.objectContaining({
          filters: {
            shared: ['true'],
          },
        }),
        search: expect.objectContaining({
          filters: {
            shared: ['true'],
          },
        }),
      });
      const excludedFilters = {
        search: ['shared'],
        browse: ['shared'],
      };

      renderComponent();

      expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({
        tenantId: centralTenantId,
        initialValues,
        excludedFilters,
      }), {});
    });
  });

  describe('when member tenant derives a shared bib record', () => {
    beforeEach(() => {
      useIsShared.mockClear().mockReturnValue({
        isShared: true,
      });
    });

    it('should pass correct props', () => {
      checkIfUserInMemberTenant.mockReturnValue(true);

      const initialValues = expect.objectContaining({
        browse: expect.objectContaining({
          filters: null,
        }),
        search: expect.objectContaining({
          filters: null,
        }),
      });
      const excludedFilters = {
        search: [],
        browse: [],
      };

      renderComponent({
        action: QUICK_MARC_ACTIONS.DERIVE,
      });

      expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({
        tenantId: null,
        initialValues,
        excludedFilters,
      }), {});
    });
  });

  it.each`
  action
  ${QUICK_MARC_ACTIONS.CREATE}
  ${QUICK_MARC_ACTIONS.EDIT}
  ${QUICK_MARC_ACTIONS.DERIVE}
  `('should pass correct props when member tenant $action a not shared bib record', ({ action }) => {
    checkIfUserInMemberTenant.mockReturnValue(true);
    useIsShared.mockClear().mockReturnValue({
      isShared: false,
    });

    const initialValues = expect.objectContaining({
      browse: expect.objectContaining({
        filters: null,
      }),
      search: expect.objectContaining({
        filters: null,
      }),
    });
    const excludedFilters = {
      search: [],
      browse: [],
    };

    renderComponent({
      action,
    });

    expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({
      tenantId: null,
      initialValues,
      excludedFilters,
    }), {});
  });

  it.each`
  action
  ${QUICK_MARC_ACTIONS.CREATE}
  ${QUICK_MARC_ACTIONS.EDIT}
  ${QUICK_MARC_ACTIONS.DERIVE}
  `('should pass correct props when central tenant $action a bib record', ({ action }) => {
    checkIfUserInCentralTenant.mockReturnValue(true);

    const initialValues = expect.objectContaining({
      browse: expect.objectContaining({
        filters: {
          shared: ['true'],
        },
      }),
      search: expect.objectContaining({
        filters: {
          shared: ['true'],
        },
      }),
    });

    const excludedFilters = {
      search: ['shared'],
      browse: ['shared'],
    };

    renderComponent({ action });

    expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({
      tenantId: null,
      initialValues,
      excludedFilters,
    }), {});
  });
});
