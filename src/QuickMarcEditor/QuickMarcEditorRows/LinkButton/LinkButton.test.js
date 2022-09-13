import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { LinkButton } from './LinkButton';

const mockOnClick = jest.fn();

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  Pluggable: ({ renderCustomTrigger }) => renderCustomTrigger({ onClick: mockOnClick }),
}));

const mockHandleLinkAuthority = jest.fn();
const mockHandleUnlinkAuthority = jest.fn();

const renderComponent = (props = {}) => render(
  <LinkButton
    handleLinkAuthority={mockHandleLinkAuthority}
    handleUnlinkAuthority={mockHandleUnlinkAuthority}
    {...props}
  />,
);

describe('Given LinkButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when field is unlinked', () => {
    it('should render link button', () => {
      const { getAllByTestId } = renderComponent({
        isLinked: false,
      });

      expect(getAllByTestId('link-authority-button')).toBeDefined();
    });
  });

  describe('when clicking on link button', () => {
    it('should call onClick', () => {
      const { getAllByTestId } = renderComponent({
        isLinked: false,
      });

      fireEvent.click(getAllByTestId('link-authority-button')[0]);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('when field is linked', () => {
    it('should render link button', () => {
      const { getAllByTestId } = renderComponent({
        isLinked: true,
      });

      expect(getAllByTestId('unlink-authority-button')).toBeDefined();
    });
  });

  describe('when clicking on unlink button', () => {
    it('should call onClick', () => {
      const { getAllByTestId } = renderComponent({
        isLinked: true,
      });

      fireEvent.click(getAllByTestId('unlink-authority-button')[0]);

      expect(mockHandleUnlinkAuthority).toHaveBeenCalled();
    });
  });
});
