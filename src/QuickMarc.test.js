/* eslint-disable react/prop-types */

import React from 'react';
import { Router } from 'react-router-dom';
import {
  render,
  cleanup,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarc from './QuickMarc';

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
  <Router history={history}>
    <QuickMarc
      onClose={onClose}
      basePath={basePath}
    />
  </Router>,
));

describe('Given Quick Marc', () => {
  afterEach(cleanup);
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

      expect(getByText('QuickMarcEditorContainer duplicate')).toBeDefined();
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
