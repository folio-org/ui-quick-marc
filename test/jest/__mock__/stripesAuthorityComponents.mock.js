jest.mock('@folio/stripes-authority-components', () => ({
  ...jest.requireActual('@folio/stripes-authority-components'),
  useAuthoritySourceFiles: jest.fn().mockResolvedValue({
    sourceFiles: [],
    isLoading: false,
  }),
}));
