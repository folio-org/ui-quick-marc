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
      autoLinkingEnabled: true,
    }, {
      id: 8,
      bibField: '600',
      authorityField: '100',
      authoritySubfields: ['a', 'b', 'c', 'd', 'g', 'j', 'q', 'f', 'h', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't'],
      autoLinkingEnabled: true,
    }, {
      id: 12,
      bibField: '650',
      authorityField: '150',
      authoritySubfields: ['a', 'b', 'g'],
      autoLinkingEnabled: false,
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
        linkDetails: {
          authorityId: 'authority-id',
          authorityNaturalId: 'n0001',
          linkingRuleId: 1,
        },
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
        linkDetails: {
          authorityId: 'authority-id',
          authorityNaturalId: 'n0001',
          linkingRuleId: 1,
        },
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
        linkDetails: {
          authorityId: 'authority-id',
          authorityNaturalId: 'n0001',
          linkingRuleId: 1,
        },
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
        linkDetails: {
          authorityId: 'authority-id',
          authorityNaturalId: 'n0001',
          linkingRuleId: 1,
        },
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
        linkDetails: {
          authorityId: 'authority-id',
          authorityNaturalId: 'n0001',
          linkingRuleId: 1,
        },
      });
    });
  });

  describe('when calling autoLinkAuthority', () => {
    it('should link fields', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [
        {
          'tag': '100',
          'content': '$a Coates, Ta-Nehisi, $e author. $0 id.loc.gov/authorities/names/n2008001084',
          'indicators': ['1', '\\'],
          'isProtected': false,
          'id': '301323a7-258c-46d0-a88a-c3ec604bf37a',
          '_isDeleted': false,
          '_isLinked': false,
        }, {
          'tag': '600',
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
        },
      ];

      const suggestedFields = [
        {
          'tag': '100',
          'content': '$0 id.loc.gov/authorities/names/n2008001084 $a Coates, Ta-Nehisi $e author. $9 5d80ecfa-7370-460e-9e27-3883a7656fe1',
          'indicators': ['1', '\\'],
          'linkDetails': {
            'authorityId': '5d80ecfa-7370-460e-9e27-3883a7656fe1',
            'authorityNaturalId': 'n2008001084',
            'linkingRuleId': 1,
            'status': 'NEW',
          },
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'indicators': ['0', '0'],
          'linkDetails': {
            'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'authorityNaturalId': 'nr2005025774',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
        },
      ];

      expect(result.current.autoLinkAuthority(fields, suggestedFields)).toEqual([
        {
          'tag': '100',
          'content': '$0 id.loc.gov/authorities/names/n2008001084 $a Coates, Ta-Nehisi $e author. $9 5d80ecfa-7370-460e-9e27-3883a7656fe1',
          'indicators': ['1', '\\'],
          'isProtected': false,
          'id': '301323a7-258c-46d0-a88a-c3ec604bf37a',
          '_isDeleted': false,
          '_isLinked': false,
          'linkDetails': {
            'authorityId': '5d80ecfa-7370-460e-9e27-3883a7656fe1',
            'authorityNaturalId': 'n2008001084',
            'linkingRuleId': 1,
            'status': 'NEW',
          },
          'subfieldGroups': {
            'controlled': '$a Coates, Ta-Nehisi',
            'uncontrolledAlpha': '$e author.',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/n2008001084',
            'nineSubfield': '$9 5d80ecfa-7370-460e-9e27-3883a7656fe1',
            'uncontrolledNumber': '',
          },
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
          'linkDetails': {
            'authorityNaturalId': 'nr2005025774',
            'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
          'subfieldGroups': {
            'controlled': '$a Brown, Benjamin,  $d 1966-',
            'uncontrolledAlpha': '$v Comic books, strips, etc.',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/nr2005025774',
            'nineSubfield': '$9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'uncontrolledNumber': '',
          },
        },
      ]);
    });
  });

  describe('when calling autoLinkAuthority', () => {
    it('should not link fields without $0', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [
        {
          'tag': '600',
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc.',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
        }, {
          'tag': '600',
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
        },
      ];

      const suggestedFields = [{
        'tag': '600',
        'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
        'indicators': ['0', '0'],
        'linkDetails': {
          'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'authorityNaturalId': 'nr2005025774',
          'linkingRuleId': 8,
          'status': 'NEW',
        },
      }];

      expect(result.current.autoLinkAuthority(fields, suggestedFields)).toEqual([
        {
          'tag': '600',
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc.',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
          'linkDetails': {
            'authorityNaturalId': 'nr2005025774',
            'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
          'subfieldGroups': {
            'controlled': '$a Brown, Benjamin,  $d 1966-',
            'uncontrolledAlpha': '$v Comic books, strips, etc.',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/nr2005025774',
            'nineSubfield': '$9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'uncontrolledNumber': '',
          },
        },
      ]);
    });
  });

  describe('when calling autoLinkAuthority', () => {
    it('should link in the correct order', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [
        {
          'tag': '600',
          'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664',
          'indicators': ['0', '7'],
          'isProtected': false,
          'id': '01f3e2b6-ccea-4fa8-9d20-0ef89bb5b39f',
          '_isDeleted': false,
          '_isLinked': false,
        }, {
          'tag': '600',
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
        },
      ];

      const suggestedFields = [
        {
          'tag': '600',
          'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 1803fee8-dfd8-42b8-a292-681af0cadb77',
          'indicators': ['0', '7'],
          'linkDetails': {
            'authorityNaturalId': 'n93100664',
            'authorityId': '1803fee8-dfd8-42b8-a292-681af0cadb77',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'indicators': ['0', '0'],
          'linkDetails': {
            'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'authorityNaturalId': 'nr2005025774',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
        },
      ];

      expect(result.current.autoLinkAuthority(fields, suggestedFields)).toEqual([
        {
          'tag': '600',
          'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 1803fee8-dfd8-42b8-a292-681af0cadb77',
          'indicators': ['0', '7'],
          'isProtected': false,
          'id': '01f3e2b6-ccea-4fa8-9d20-0ef89bb5b39f',
          '_isDeleted': false,
          '_isLinked': false,
          'linkDetails': {
            'authorityNaturalId': 'n93100664',
            'authorityId': '1803fee8-dfd8-42b8-a292-681af0cadb77',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
          'subfieldGroups': {
            'controlled': '$a Yuan, Bing',
            'uncontrolledAlpha': '',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/n93100664',
            'nineSubfield': '$9 1803fee8-dfd8-42b8-a292-681af0cadb77',
            'uncontrolledNumber': '',
          },
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'indicators': ['0', '0'],
          'isProtected': false,
          'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
          '_isDeleted': false,
          '_isLinked': false,
          'linkDetails': {
            'authorityNaturalId': 'nr2005025774',
            'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
          'subfieldGroups': {
            'controlled': '$a Brown, Benjamin,  $d 1966-',
            'uncontrolledAlpha': '$v Comic books, strips, etc.',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/nr2005025774',
            'nineSubfield': '$9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'uncontrolledNumber': '',
          },
        },
      ]);
    });
  });

  describe('when calling autoLinkAuthority and there is a field with the ERROR status', () => {
    it('should be left as is', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [{
        'tag': '600',
        'content': '$a Medycyna. $v Comic books, strips, etc. $0 vtls000869135',
        'indicators': ['\\', '0'],
        'isProtected': false,
        'id': '103073ce-b2c8-4f92-ba2f-a65f733b3f02',
        '_isDeleted': false,
        '_isLinked': false,
      }];

      const suggestedFields = [{
        'tag': '600',
        'content': '$a Medycyna. $v Comic books, strips, etc. $0 vtls000869135',
        'indicators': ['\\', '0'],
        'linkDetails': {
          'status': 'ERROR',
          'errorCause': '101',
        },
      }];

      expect(result.current.autoLinkAuthority(fields, suggestedFields)).toEqual([{
        'tag': '600',
        'content': '$a Medycyna. $v Comic books, strips, etc. $0 vtls000869135',
        'indicators': ['\\', '0'],
        'isProtected': false,
        'id': '103073ce-b2c8-4f92-ba2f-a65f733b3f02',
        '_isDeleted': false,
        '_isLinked': false,
      }]);
    });
  });

  describe('when calling autoLinkAuthority and there is a field that cannot be linked', () => {
    it('should be left as is', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [{
        'tag': '600',
        'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
        'indicators': ['0', '0'],
        'isProtected': false,
        'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
        '_isDeleted': false,
        '_isLinked': false,
      }];

      const suggestedFields = [{
        'tag': '600',
        'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
        'indicators': ['0', '0'],
      }];

      expect(result.current.autoLinkAuthority(fields, suggestedFields)).toEqual([{
        'tag': '600',
        'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
        'indicators': ['0', '0'],
        'isProtected': false,
        'id': 'bc44d91c-6915-4609-9fd1-bbe470f4740b',
        '_isDeleted': false,
        '_isLinked': false,
      }]);
    });
  });

  describe('when calling autoLinkAuthority', () => {
    it('should return non-linkable fields too', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [{
        'tag': 'LDR',
        'content': '05274cam\\a2201021\\i\\4500',
        'id': 'LDR',
        '_isDeleted': false,
        '_isLinked': false,
      }];

      const suggestedFields = [];

      expect(result.current.autoLinkAuthority(fields, suggestedFields)).toEqual([{
        'tag': 'LDR',
        'content': '05274cam\\a2201021\\i\\4500',
        'id': 'LDR',
        '_isDeleted': false,
        '_isLinked': false,
      }]);
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
        linkDetails: {
          authorityId: 'authority-id',
          authorityNaturalId: 'n0001',
          linkingRuleId: 1,
        },
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
        linkDetails: {
          authorityId: 'authority-id',
          authorityNaturalId: 'n0001',
          linkingRuleId: 1,
        },
        subfieldGroups: {},
      };

      expect(result.current.unlinkAuthority(field)).toEqual({
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
