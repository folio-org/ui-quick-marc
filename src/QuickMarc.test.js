/* eslint-disable react/prop-types */

import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';

import { createMemoryHistory } from 'history';

import QuickMarc from './QuickMarc';

import Harness from '../test/jest/helpers/harness';
import { QuickMarcProvider } from './contexts';
import { QUICK_MARC_ACTIONS } from './QuickMarcEditor/constants';
import { MARC_TYPES } from './common';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useUserTenantPermissions: jest.fn().mockReturnValue({
    userPermissions: [],
    isFetching: false,
  }),
}));

jest.mock('./QuickMarcEditor', () => {
  return {
    QuickMarcEditorContainer: () => <span>QuickMarcEditorContainer</span>,
  };
});

jest.mock('./contexts', () => ({
  QuickMarcProvider: jest.fn(({ children }) => <div>{children}</div>),
}));

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

const basePath = '/some-path';

const renderQuickMarc = (props = {}) => (render(
  <Harness history={props.history}>
    <QuickMarc
      onClose={mockOnClose}
      onSave={mockOnSave}
      basePath={basePath}
      {...props}
    />
  </Harness>,
));

describe('Given Quick Marc', () => {
  let history = null;

  beforeEach(() => {
    history = createMemoryHistory();
  });

  describe('When visiting "derive" route', () => {
    beforeEach(() => {
      history.push(`${basePath}/derive-bibliographic/1234`);
    });

    it('should display correct route', () => {
      const { getByText } = renderQuickMarc({ history });

      const expectedProps = {
        action: QUICK_MARC_ACTIONS.DERIVE,
        marcType: MARC_TYPES.BIB,
        basePath,
        children: expect.anything(),
      };

      expect(getByText('QuickMarcEditorContainer')).toBeDefined();
      expect(QuickMarcProvider).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('When visiting "edit" route', () => {
    beforeEach(() => {
      history.push(`${basePath}/edit-bibliographic/1234`);
    });

    it('should display correct route', () => {
      const { getByText } = renderQuickMarc({ history });

      const expectedProps = {
        action: QUICK_MARC_ACTIONS.EDIT,
        marcType: MARC_TYPES.BIB,
        basePath,
        children: expect.anything(),
      };

      expect(getByText('QuickMarcEditorContainer')).toBeDefined();
      expect(QuickMarcProvider).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('When visiting "create" route', () => {
    beforeEach(() => {
      history.push(`${basePath}/create-holdings/1234`);
    });

    it('should display correct route', () => {
      const { getByText } = renderQuickMarc({ history });

      const expectedProps = {
        action: QUICK_MARC_ACTIONS.CREATE,
        marcType: MARC_TYPES.HOLDINGS,
        basePath,
        children: expect.anything(),
      };

      expect(getByText('QuickMarcEditorContainer')).toBeDefined();
      expect(QuickMarcProvider).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });
});
