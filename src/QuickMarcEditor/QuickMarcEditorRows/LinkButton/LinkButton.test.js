import React from 'react';
import {
  act,
  fireEvent,
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import { Pluggable } from '@folio/stripes/core';
import { runAxeTest } from '@folio/stripes-testing';

import { createMemoryHistory } from 'history';
import { LinkButton } from './LinkButton';

import Harness from '../../../../test/jest/helpers/harness';

const mockOnClick = jest.fn();
const mockGetMarcSource = jest.fn(() => ({ json: () => {} }));

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useCallout: () => ({
    sendCallout: jest.fn(),
  }),
  useNamespace: jest.fn().mockReturnValue(['ui-quick-marc-test']),
  useOkapiKy: jest.fn(() => ({
    get: mockGetMarcSource,
    extend: jest.fn(),
  })),
  Pluggable: jest.fn(({ renderCustomTrigger }) => renderCustomTrigger({ onClick: mockOnClick })),
}));

const mockHandleLinkAuthority = jest.fn();
const mockHandleUnlinkAuthority = jest.fn();

const renderComponent = (props = {}) => render(
  <Harness history={props.history}>
    <LinkButton
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

        await act(async () => { Pluggable.mock.calls[0][0].onLinkRecord(authority); });
        act(() => { Pluggable.mock.calls[1][0].onLinkRecord(authority); });

        expect(mockGetMarcSource).toHaveBeenCalledTimes(2);
      });
    });

    describe('when bib record is shared', () => {
      it('should pass central tenant id', async () => {
        const centralTenantId = 'consortia';
        const history = createMemoryHistory({
          initialEntries: [{ search: '?shared=true' }],
        });

        renderComponent({ history });

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ tenantId: centralTenantId }), {});
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

    describe('when linking Authority to empty field and record is shared', () => {
      it('should pass initial values to plugin', async () => {
        const history = createMemoryHistory({
          initialEntries: [{ search: '?shared=true' }],
        });
        const { getAllByTestId } = renderComponent({
          history,
        });

        const initialValues = {
          search: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: { shared: ['true'] },
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: { shared: ['true'] },
          },
          segment: 'browse',
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
            searchInputValue: 'identifiers.value==n123456789',
            searchQuery: 'identifiers.value==n123456789',
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
            searchInputValue: 'identifiers.value==n123456789 or identifiers.value==n987654321',
            searchQuery: 'identifiers.value==n123456789 or identifiers.value==n987654321',
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

    describe('when linking Authority to a field with $0 and record is shared', () => {
      it('should pass initial values to plugin', async () => {
        const history = createMemoryHistory({
          initialEntries: [{ search: '?shared=true' }],
        });

        const { getAllByTestId } = renderComponent({
          content: '$0 n123456789',
          history,
        });

        const initialValues = {
          search: {
            dropdownValue: 'advancedSearch',
            searchIndex: 'advancedSearch',
            searchInputValue: 'identifiers.value==n123456789',
            searchQuery: 'identifiers.value==n123456789',
            filters: { shared: ['true'] },
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: { shared: ['true'] },
          },
          segment: 'search',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });

    describe('when linking Authority to a field with $a, $d or $t', () => {
      it('should pass initial values to plugin', async () => {
        const { getAllByTestId } = renderComponent({
          content: '$a value1 $d value2 $t value3',
        });

        const initialValues = {
          search: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: null,
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            searchInputValue: 'value1 value2 value3',
            searchQuery: 'value1 value2 value3',
            filters: null,
          },
          segment: 'browse',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });

    describe('when linking Authority to a field with $a, $d or $t and record is shared', () => {
      it('should pass initial values to plugin', async () => {
        const history = createMemoryHistory({
          initialEntries: [{ search: '?shared=true' }],
        });

        const { getAllByTestId } = renderComponent({
          content: '$a value1 $d value2 $t value3',
          history,
        });

        const initialValues = {
          search: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            filters: { shared: ['true'] },
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchIndex: 'personalNameTitle',
            searchInputValue: 'value1 value2 value3',
            searchQuery: 'value1 value2 value3',
            filters: { shared: ['true'] },
          },
          segment: 'browse',
        };

        fireEvent.click(getAllByTestId('link-authority-button-fakeId')[0]);

        expect(Pluggable).toHaveBeenLastCalledWith(expect.objectContaining({ initialValues }), {});
      });
    });

    describe('when linking Authority to a field with $a, $d or $t and with multiple $0', () => {
      it('should pass initial values to plugin', async () => {
        const { getAllByTestId } = renderComponent({
          content: '$a value1 $d value2 $t value3 $0 value4 $0 http://id.workldcat.org/fast/value5',
        });

        const initialValues = {
          search: {
            dropdownValue: 'advancedSearch',
            searchIndex: 'advancedSearch',
            searchInputValue: 'keyword==value1 value2 value3 or identifiers.value==value4 or identifiers.value==value5',
            searchQuery: 'keyword==value1 value2 value3 or identifiers.value==value4 or identifiers.value==value5',
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
      fireEvent.click(getByText('ui-quick-marc.record.unlink.confirm.confirm'));

      expect(mockHandleUnlinkAuthority).toHaveBeenCalled();
    });
  });

  describe('when isLoading is true', () => {
    it('should not be displayed', () => {
      const { queryAllByTestId } = renderComponent({ isLoading: true });

      expect(queryAllByTestId('link-authority-button-fakeId')[0]).toBeUndefined();
    });
  });
});
