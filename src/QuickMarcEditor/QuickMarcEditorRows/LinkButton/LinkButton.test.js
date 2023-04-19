import React from 'react';
import {
  act,
  fireEvent,
  render,
} from '@testing-library/react';

import { Pluggable } from '@folio/stripes/core';
import { runAxeTest } from '@folio/stripes-testing';

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
  })),
  Pluggable: jest.fn(({ renderCustomTrigger }) => renderCustomTrigger({ onClick: mockOnClick })),
}));

const mockHandleLinkAuthority = jest.fn();
const mockHandleUnlinkAuthority = jest.fn();

const renderComponent = (props = {}) => render(
  <Harness>
    <LinkButton
      handleLinkAuthority={mockHandleLinkAuthority}
      handleUnlinkAuthority={mockHandleUnlinkAuthority}
      isLinked={false}
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

    describe('when linking Authority to empty field', () => {
      it('should pass initial values to plugin', async () => {
        const { getAllByTestId } = renderComponent();

        const initialValues = {
          search: {
            dropdownValue: 'personalNameTitle',
          },
          browse: {
            dropdownValue: 'personalNameTitle',
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
            dropdownValue: 'identifiers.value',
            searchInputValue: 'n123456789',
            searchQuery: 'n123456789',
          },
          browse: {
            dropdownValue: 'personalNameTitle',
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
            searchInputValue: 'identifiers.value==n123456789 or identifiers.value==n987654321',
            searchQuery: 'identifiers.value==n123456789 or identifiers.value==n987654321',
          },
          browse: {
            dropdownValue: 'personalNameTitle',
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
          },
          browse: {
            dropdownValue: 'personalNameTitle',
            searchInputValue: 'value1 value2 value3',
            searchQuery: 'value1 value2 value3',
          },
          segment: 'browse',
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
});
