/* eslint-disable react/prop-types */

import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';

import QuickMarc from './QuickMarc';

import Harness from '../test/jest/helpers/harness';

jest.mock('./queries', () => ({
  ...jest.requireActual('./queries'),
  useUserTenantPermissions: jest.fn().mockReturnValue({
    userPermissions: [],
    isFetching: false,
  }),
}));

jest.mock('./QuickMarcEditor', () => {
  return {
    QuickMarcEditorContainer: ({ action }) => <span>QuickMarcEditorContainer {action}</span>,
  };
});

const renderQuickMarc = ({
  basePath,
  onClose,
  history,
}) => (render(
  <Harness history={history}>
    <QuickMarc
      onClose={onClose}
      basePath={basePath}
    />
  </Harness>,
));

describe('Given Quick Marc', () => {
  let history = null;

  beforeEach(() => {
    history = createMemoryHistory();
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
