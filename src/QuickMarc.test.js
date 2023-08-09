/* eslint-disable react/prop-types */

import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';

import buildStripes from '../test/jest/__mock__/stripesCore.mock';

import QuickMarc from './QuickMarc';

import Harness from '../test/jest/helpers/harness';
import { useUserTenantPermissions } from './queries';

jest.mock('./queries', () => ({
  ...jest.requireActual('./queries'),
  useUserTenantPermissions: jest.fn(),
}));

jest.mock('./QuickMarcEditor', () => {
  return {
    QuickMarcEditorContainer: ({ action }) => <span>QuickMarcEditorContainer {action}</span>,
  };
});

const renderQuickMarc = ({
  basePath,
  onClose = () => {},
  history,
  stripes = buildStripes(),
}) => (render(
  <Harness history={history}>
    <QuickMarc
      onClose={onClose}
      basePath={basePath}
      stripes={stripes}
    />
  </Harness>,
));

describe('Given Quick Marc', () => {
  let history = null;

  beforeEach(() => {
    history = createMemoryHistory();

    useUserTenantPermissions.mockReturnValue({
      userPermissions: [],
      isFetching: false,
    });
  });

  describe('when a member tenant edits shared record', () => {
    it('should fetch the central tenant permissions', () => {
      history.push('/inventory/quick-marc/edit-bib?shared=true');

      const userPermissions = [{
        permissionName: 'ui-quick-marc.quick-marc-editor.all',
      }];

      useUserTenantPermissions.mockReturnValue({
        userPermissions,
        isFetching: false,
      });

      renderQuickMarc({
        basePath: '/some-path',
        history,
      });

      expect(useUserTenantPermissions).toHaveBeenCalledWith({
        tenantId: 'consortia',
        userId: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
      }, {
        enabled: true,
      });
    });
  });

  describe('When visiting "duplicate" route', () => {
    beforeEach(() => {
      history.push('/some-path/duplicate-bib/1234');
    });

    it('should display correct route', () => {
      const { getByText } = renderQuickMarc({
        onClose: jest.fn(),
        basePath: '/some-path',
        history,
      });

      expect(getByText('QuickMarcEditorContainer derive')).toBeDefined();
    });
  });

  describe('When visiting "edit" route', () => {
    beforeEach(() => {
      history.push('/some-path/edit-bib/1234');
    });

    it('should display correct route', () => {
      const { getByText } = renderQuickMarc({
        onClose: jest.fn(),
        basePath: '/some-path',
        history,
      });

      expect(getByText('QuickMarcEditorContainer edit')).toBeDefined();
    });
  });

  describe('When visiting "create" route', () => {
    beforeEach(() => {
      history.push('/some-path/create-holdings/1234');
    });

    it('should display correct route', () => {
      const { getByText } = renderQuickMarc({
        onClose: jest.fn(),
        basePath: '/some-path',
        history,
      });

      expect(getByText('QuickMarcEditorContainer create')).toBeDefined();
    });
  });
});
