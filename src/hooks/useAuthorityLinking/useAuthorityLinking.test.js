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

const authoritySource = {
  fields: [{
    tag: '100',
    content: '$a authority value',
  }],
};

describe('Given useAuthorityLinking', () => {
  describe('when calling linkAuthority with not matched source file', () => {
    it('should return field as it is', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        sourceFileId: '4',
      };
      const field = {
        tag: '100',
        content: '$a some value $b some other value',
      };

      expect(result.current.linkAuthority(authority, authoritySource, field)).toMatchObject(field);
    });
  });

  describe('when calling linkAuthority with not existing $0 subfield', () => {
    it('should return field with new $0 and $9 subfields and authority subfields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const field = {
        tag: '100',
        content: '$a some value $b some other value',
      };

      expect(result.current.linkAuthority(authority, authoritySource, field)).toMatchObject({
        content: '$a authority value $b some other value $0 http://some.url/n0001 $9 authority-id',
      });
    });
  });

  describe('when calling linkAuthority with not matched $0 subfield and authority.naturalId', () => {
    it('should return field with new $0 and $9 subfields and authority subfields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const field = {
        tag: '100',
        content: '$a some value $b some other value $0 some.url/n0002 $9 authority-other-id',
      };

      expect(result.current.linkAuthority(authority, authoritySource, field)).toMatchObject({
        content: '$a authority value $b some other value $0 http://some.url/n0001 $9 authority-id',
      });
    });
  });

  describe('when calling linkAuthority with repeated subfields', () => {
    it('should return field with correctly formatted subfields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const field = {
        tag: '100',
        content: '$a some value $b some other value $e author $e illustrator',
      };

      expect(result.current.linkAuthority(authority, authoritySource, field)).toMatchObject({
        content: '$a authority value $b some other value $e author $e illustrator $0 http://some.url/n0001 $9 authority-id',
      });
    });
  });

  describe('when calling unlinkAuthority', () => {
    it('should return field with correct data', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const field = {
        tag: '100',
        content: '$a authority value $b some other value $e author $e illustrator $0 http://some.url/n0001 $9 authority-id',
        authorityNaturalId: 'n0001',
        authorityId: 'authority-id',
      };

      expect(result.current.unlinkAuthority(field)).toMatchObject({
        tag: '100',
        content: '$a authority value $b some other value $e author $e illustrator $0 http://some.url/n0001',
      });
    });
  });
});
