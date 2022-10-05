import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import useAuthorityLinking from './useAuthorityLinking';

jest.mock('../useAuthoritySourceFiles', () => ({
  useAuthoritySourceFiles: jest.fn().mockReturnValue({
    sourceFiles: [{
      id: '1',
      baseUrl: 'some.url/',
    }, {
      id: '2',
      baseUrl: 'some.other.url/',
    }],
  }),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Given useAuthorityLinking', () => {
  describe('when calling linkAuthority with not matched source file', () => {
    it('should return field as it is', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        sourceFileId: '4',
      };
      const field = {
        content: '$a some value $b some other value',
      };

      expect(result.current.linkAuthority(authority, field)).toMatchObject(field);
    });
  });

  describe('when calling linkAuthority with not existing $0 subfield', () => {
    it('should return field with new $0 and $9 subfields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const field = {
        content: '$a some value $b some other value',
      };

      expect(result.current.linkAuthority(authority, field)).toMatchObject({
        content: '$a some value $b some other value $0 some.url/n0001 $9 authority-id',
      });
    });
  });

  describe('when calling linkAuthority with not matched $0 subfield and authority.naturalId', () => {
    it('should return field with new $0 and $9 subfields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const field = {
        content: '$a some value $b some other value $0 some.url/n0002 $9 authority-other-id',
      };

      expect(result.current.linkAuthority(authority, field)).toMatchObject({
        content: '$a some value $b some other value $0 some.url/n0001 $9 authority-id',
      });
    });
  });
});
