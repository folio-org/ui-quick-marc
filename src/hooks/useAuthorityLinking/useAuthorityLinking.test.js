import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import useAuthorityLinking from './useAuthorityLinking';
import { useAuthorityLinkingRules } from '../../queries';

jest.mock('../../queries', () => ({
  useAuthorityLinkingRules: jest.fn().mockReturnValue({
    linkingRules: [{
      id: 1,
      bibField: '100',
      authorityField: '100',
      authoritySubfields: ['a', 'b', 't', 'd'],
      subfieldModifications: [],
      validation: {},
    }],
    isLoading: false,
  }),
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
    content: '$a authority value $b fakeB $t field for modification',
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

  describe('when calling linkAuthority and some subfields are in the linking rule but not in authority', () => {
    it('should return field without invalid subfields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authSource = {
        fields: [{
          tag: '100',
          content: '$a Beethoven, Ludwig van',
        }],
      };
      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const field = {
        tag: '100',
        content: '$a Beethoven, Ludwig van, $d 1770-1827, $e composer.',
      };

      expect(result.current.linkAuthority(authority, authSource, field)).toMatchObject({
        content: '$a Beethoven, Ludwig van $e composer. $0 some.url/n0001 $9 authority-id',
        linkingRuleId: 1,
      });
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
        content: '$a authority value $b fakeB $0 some.url/n0001 $t field for modification $9 authority-id',
        linkingRuleId: 1,
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
        content: '$a authority value $b fakeB $0 some.url/n0001 $9 authority-id $t field for modification',
        linkingRuleId: 1,
      });
    });
  });

  describe('when calling linkAuthority with matched $0 subfield and authority.naturalId', () => {
    it('should return field with new $0 and $9 subfields and authority subfields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const field = {
        tag: '100',
        content: '$a some value $b some other value $0 n0001 $9 authority-other-id',
      };

      expect(result.current.linkAuthority(authority, authoritySource, field)).toMatchObject({
        content: '$a authority value $b fakeB $0 some.url/n0001 $9 authority-id $t field for modification',
        linkingRuleId: 1,
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
        content: '$a authority value $b fakeB $e author $e illustrator $0 some.url/n0001 $t field for modification $9 authority-id',
        linkingRuleId: 1,
      });
    });
  });

  describe('when linking requires subfield modification', () => {
    it('should return field with correctly formatted subfields', () => {
      useAuthorityLinkingRules.mockReturnValue({
        linkingRules: [{
          id: 1,
          bibField: '100',
          authorityField: '100',
          authoritySubfields: ['a', 'b', 't'],
          subfieldModifications: [{
            source: 't',
            target: 'c',
          }],
          validation: {
            existence: [{
              t: true,
            }],
          },
        }],
      });

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
        content: '$a authority value $b fakeB $e author $e illustrator $0 some.url/n0001 $c field for modification $9 authority-id',
        linkingRuleId: 1,
      });
    });
  });

  describe('when calling linkAuthority without saving changes, and then unlinkAuthority', () => {
    const authority = {
      id: 'authority-id',
      sourceFileId: '1',
      naturalId: 'n0001',
    };

    it('should return previous field content', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });
      const field = {
        tag: '100',
        content: '$a Crumb, George. test',
      };

      const linkedField = result.current.linkAuthority(authority, authoritySource, field);
      const unlinkedField = result.current.unlinkAuthority(linkedField);

      expect(unlinkedField.content).toBe('$a Crumb, George. test');
    });

    it('should return previous field content even if it is empty', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });
      const field = {
        tag: '100',
        content: '',
      };

      const linkedField = result.current.linkAuthority(authority, authoritySource, field);
      const unlinkedField = result.current.unlinkAuthority(linkedField);

      expect(unlinkedField.content).toBe('');
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

  describe('when authority record doesnt pass required subfields validation', () => {
    it('should throw validation error', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });
      const field = {
        tag: '100',
        content: '$a Crumb, George. test',
      };
      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const authoritySourceWithoutMatchingField = {
        fields: [{
          tag: '100',
          content: '$a authority value',
        }],
      };

      expect(() => result.current.linkAuthority(authority, authoritySourceWithoutMatchingField, field))
        .toThrow('ui-quick-marc.record.link.validation.invalidHeading');
    });
  });

  describe('when records dont have fields that can be linked', () => {
    it('should return field without changes', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });
      const field = {
        tag: '100',
        content: '$a Crumb, George. test',
      };
      const authority = {
        id: 'authority-id',
        sourceFileId: '1',
        naturalId: 'n0001',
      };
      const authoritySourceWithoutMatchingField = {
        fields: [{
          tag: '110',
          content: '$a authority value',
        }],
      };

      expect(() => result.current.linkAuthority(authority, authoritySourceWithoutMatchingField, field))
        .toThrow('ui-quick-marc.record.link.validation.invalidHeading');
    });
  });
});
