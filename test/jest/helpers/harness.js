import { Router as DefaultRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { StripesContext } from '@folio/stripes/core';

import IntlProvider from './intl';
import buildStripes from '../__mock__/stripesCore.mock';
import {
  QuickMarcContext,
  QuickMarcProvider,
} from '../../../src/contexts';

const STRIPES = buildStripes();

const defaultHistory = createMemoryHistory();

const queryClient = new QueryClient();

const defaultQuickMarcContextValue = {
  validationErrorsRef: { current: {} },
  setValidationErrors: jest.fn(),
};

const QuickMarcProviderMock = ({ ctxValue, children }) => (
  <QuickMarcContext.Provider value={{ ...defaultQuickMarcContextValue, ...ctxValue }}>
    {children}
  </QuickMarcContext.Provider>
);

const Harness = ({
  Router = DefaultRouter,
  stripes,
  children,
  history = defaultHistory,
  quickMarcContext,
}) => {
  const QuickMarcProviderComponent = quickMarcContext
    ? QuickMarcProviderMock
    : QuickMarcProvider;

  return (
    <QueryClientProvider client={queryClient}>
      <StripesContext.Provider value={stripes || STRIPES}>
        <Router history={history}>
          <IntlProvider>
            <QuickMarcProviderComponent ctxValue={quickMarcContext}>
              {children}
            </QuickMarcProviderComponent>
          </IntlProvider>
        </Router>
      </StripesContext.Provider>
    </QueryClientProvider>
  );
};

export default Harness;
