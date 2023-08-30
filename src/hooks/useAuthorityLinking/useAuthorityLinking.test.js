/* eslint-disable max-lines */
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { checkIfUserInMemberTenant } from '@folio/stripes/core';
import useAuthorityLinking from './useAuthorityLinking';
import {
  useAuthorityLinkingRules,
  useLinkSuggestions,
} from '../../queries';
import { MARC_TYPES } from '../../common/constants';

const mockFetchLinkSuggestions = jest.fn();

jest.mock('../../queries', () => ({
  useAuthorityLinkingRules: jest.fn(),
  useAuthoritySourceFiles: jest.fn().mockReturnValue({
    sourceFiles: [{
      id: '1',
      baseUrl: 'some.url/',
    }, {
      id: '2',
      baseUrl: 'some.other.url/',
    }],
  }),
  useLinkSuggestions: jest.fn(),
}));

const linkingRules = {
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
  }, {
    id: 15,
    bibField: '700',
    authorityField: '100',
    authoritySubfields: ['a', 'b', 'c', 'd', 'j', 'q', 'f', 'h', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'g'],
    autoLinkingEnabled: true,
  }, {
    id: 17,
    bibField: '711',
    authorityField: '111',
    authoritySubfields: ['a', 'c', 'e', 'q', 'f', 'h', 'k', 'l', 'p', 's', 't', 'd', 'g', 'n'],
    autoLinkingEnabled: true,
  }],
  isLoading: false,
};

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
  beforeEach(() => {
    jest.clearAllMocks();

    checkIfUserInMemberTenant.mockReturnValue(false);
    useAuthorityLinkingRules.mockReturnValue(linkingRules);
    useLinkSuggestions.mockReturnValue({
      fetchLinkSuggestions: mockFetchLinkSuggestions,
    });
  });

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
          'content': '$a Coates, Ta-Nehisi, $e author. $0 n2008001084',
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
          'linkDetails': {
            'authorityId': '5d80ecfa-7370-460e-9e27-3883a7656fe1',
            'authorityNaturalId': 'n2008001084',
            'linkingRuleId': 1,
            'status': 'NEW',
          },
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
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
          'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 5d80ecfa-7370-460e-9e27-3883a7656fe1',
          'prevContent': '$a Coates, Ta-Nehisi, $e author. $0 n2008001084',
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
          'content': '$a Brown, Benjamin, $d 1966- $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'prevContent': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774',
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
            'controlled': '$a Brown, Benjamin, $d 1966-',
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
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
          'content': '$a Brown, Benjamin, $d 1966- $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'prevContent': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
            'controlled': '$a Brown, Benjamin, $d 1966-',
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
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
          'linkDetails': {
            'authorityNaturalId': 'n93100664',
            'authorityId': '1803fee8-dfd8-42b8-a292-681af0cadb77',
            'linkingRuleId': 8,
            'status': 'NEW',
          },
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
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
          'prevContent': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664',
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
          'content': '$a Brown, Benjamin, $d 1966- $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'prevContent': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
            'controlled': '$a Brown, Benjamin, $d 1966-',
            'uncontrolledAlpha': '$v Comic books, strips, etc.',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/nr2005025774',
            'nineSubfield': '$9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'uncontrolledNumber': '',
          },
        },
      ]);
    });
  });

  describe('when calling autoLinkAuthority and returning an error for a field with the same tag', () => {
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
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
          'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664',
          'linkDetails': {
            'status': 'ERROR',
          },
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
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
          'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664',
          'indicators': ['0', '7'],
          'isProtected': false,
          'id': '01f3e2b6-ccea-4fa8-9d20-0ef89bb5b39f',
          '_isDeleted': false,
          '_isLinked': false,
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $d 1966- $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'prevContent': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
            'controlled': '$a Brown, Benjamin, $d 1966-',
            'uncontrolledAlpha': '$v Comic books, strips, etc.',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/nr2005025774',
            'nineSubfield': '$9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'uncontrolledNumber': '',
          },
        },
      ]);
    });
  });

  describe('when calling autoLinkAuthority and there is no suggestion for a field with the same tag', () => {
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
          'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
          'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664',
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
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
          'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664',
          'indicators': ['0', '7'],
          'isProtected': false,
          'id': '01f3e2b6-ccea-4fa8-9d20-0ef89bb5b39f',
          '_isDeleted': false,
          '_isLinked': false,
        }, {
          'tag': '600',
          'content': '$a Brown, Benjamin, $d 1966- $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
          'prevContent': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc. $0 nr2005025774',
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
            'controlled': '$a Brown, Benjamin, $d 1966-',
            'uncontrolledAlpha': '$v Comic books, strips, etc.',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/nr2005025774',
            'nineSubfield': '$9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'uncontrolledNumber': '',
          },
        },
      ]);
    });
  });

  describe('when calling autoLinkAuthority and there is a field with ERROR status and there is no $9', () => {
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

  describe('when calling autoLinkAuthority and there is a field with ERROR status and there is $9', () => {
    it('should get rid of the $9', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [{
        'tag': '600',
        'content': '$a Medycyna. $v Comic books, strips, etc. $0 vtls000869135 $9 UUID',
        'indicators': ['\\', '0'],
        'isProtected': false,
        'id': '103073ce-b2c8-4f92-ba2f-a65f733b3f02',
        '_isDeleted': false,
        '_isLinked': false,
      }];

      const suggestedFields = [{
        'tag': '600',
        'content': '$a Medycyna. $v Comic books, strips, etc. $0 vtls000869135 $9 UUID',
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

  describe('when there is already a linked field', () => {
    describe('and the user enters $9 into the split uncontrolledNumber or uncontrolledAlpha field and calls autoLinkAuthority', () => {
      it('should get rid of the $9', () => {
        const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

        const fields = [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 0c63add7-b3f3-4eae-874d-c659acb95174',
            'indicators': ['1', '\\'],
            'isProtected': false,
            'id': 'cb867f32-c4ba-4714-91cb-6f828765b17a',
            '_isDeleted': false,
            '_isLinked': true,
            'linkDetails': {
              'authorityId': '0c63add7-b3f3-4eae-874d-c659acb95174',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
            'subfieldGroups': {
              'controlled': '$a Coates, Ta-Nehisi',
              'uncontrolledAlpha': '$e author. $9 test',
              'zeroSubfield': '$0 id.loc.gov/authorities/names/n2008001084',
              'nineSubfield': '$9 0c63add7-b3f3-4eae-874d-c659acb95174',
              'uncontrolledNumber': '$9 test $2 test',
            },
            'prevContent': '$a Coates, Ta-Nehisi, $e author. $0 n2008001084',
          },
          {
            'tag': '600',
            'content': '$a Medycyna. $v Comic books, strips, etc. $0 vtls000869135',
            'indicators': ['\\', '0'],
            'isProtected': false,
            'id': '103073ce-b2c8-4f92-ba2f-a65f733b3f02',
            '_isDeleted': false,
            '_isLinked': false,
          },
        ];

        const suggestedFields = [
          {
            'tag': '600',
            'content': '$a Brown, Benjamin, $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $d 1966- $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
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
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 0c63add7-b3f3-4eae-874d-c659acb95174',
            'indicators': ['1', '\\'],
            'isProtected': false,
            'id': 'cb867f32-c4ba-4714-91cb-6f828765b17a',
            '_isDeleted': false,
            '_isLinked': true,
            'linkDetails': {
              'authorityId': '0c63add7-b3f3-4eae-874d-c659acb95174',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
            'subfieldGroups': {
              'controlled': '$a Coates, Ta-Nehisi',
              'uncontrolledAlpha': '$e author.',
              'zeroSubfield': '$0 id.loc.gov/authorities/names/n2008001084',
              'nineSubfield': '$9 0c63add7-b3f3-4eae-874d-c659acb95174',
              'uncontrolledNumber': '$2 test',
            },
            'prevContent': '$a Coates, Ta-Nehisi, $e author. $0 n2008001084',
          },
          {
            'tag': '600',
            'content': '$a Brown, Benjamin, $d 1966- $v Comic books, strips, etc. $0 id.loc.gov/authorities/names/nr2005025774 $9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'prevContent': '$a Medycyna. $v Comic books, strips, etc. $0 vtls000869135',
            'linkDetails': {
              'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
              'authorityNaturalId': 'nr2005025774',
              'linkingRuleId': 8,
              'status': 'NEW',
            },
            'subfieldGroups': {
              'controlled': '$a Brown, Benjamin, $d 1966-',
              'nineSubfield': '$9 46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
              'uncontrolledAlpha': '$v Comic books, strips, etc.',
              'uncontrolledNumber': '',
              'zeroSubfield': '$0 id.loc.gov/authorities/names/nr2005025774',
            },
            'indicators': ['\\', '0'],
            'isProtected': false,
            'id': '103073ce-b2c8-4f92-ba2f-a65f733b3f02',
            '_isDeleted': false,
            '_isLinked': false,
          },
        ]);
      });
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
    it('should take uncontrolled subfields from the current field, not from suggested one', () => {
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const fields = [
        {
          'tag': '711',
          'content': '$j something $0 n2008001084 $2 fast $f test',
          'indicators': ['\\', '\\'],
          'isProtected': false,
          'id': '01f3e2b6-ccea-4fa8-9d20-0ef89bb5b39f',
          '_isDeleted': false,
          '_isLinked': false,
        },
      ];

      const suggestedFields = [
        {
          'tag': '711',
          'content': '$0 id.loc.gov/authorities/names/n2008001084 $a Roma Council $c Basilica $d 1962-1965 : $n (2nd : $9 5d80ecfa-7370-460e-9e27-3883a7656fe1 $j test',
          'linkDetails': {
            'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'authorityNaturalId': 'n2008001084',
            'linkingRuleId': 17,
            'status': 'NEW',
          },
        },
      ];

      expect(result.current.autoLinkAuthority(fields, suggestedFields)).toEqual([
        {
          'tag': '711',
          'content': '$a Roma Council $c Basilica $d 1962-1965 : $n (2nd : $j something $0 id.loc.gov/authorities/names/n2008001084 $9 5d80ecfa-7370-460e-9e27-3883a7656fe1 $2 fast',
          'indicators': ['\\', '\\'],
          'prevContent': '$j something $0 n2008001084 $2 fast $f test',
          'isProtected': false,
          'id': '01f3e2b6-ccea-4fa8-9d20-0ef89bb5b39f',
          '_isDeleted': false,
          '_isLinked': false,
          'linkDetails': {
            'authorityId': '46b1a960-9ca2-43c1-b2b7-a7eafbc6c9d2',
            'authorityNaturalId': 'n2008001084',
            'linkingRuleId': 17,
            'status': 'NEW',
          },
          'subfieldGroups': {
            'controlled': '$a Roma Council $c Basilica $d 1962-1965 : $n (2nd :',
            'uncontrolledAlpha': '$j something',
            'zeroSubfield': '$0 id.loc.gov/authorities/names/n2008001084',
            'nineSubfield': '$9 5d80ecfa-7370-460e-9e27-3883a7656fe1',
            'uncontrolledNumber': '$2 fast',
          },
        },
      ]);
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

  describe('when calling actualizeLinks and there is no linked field', () => {
    it('should return the same form values', async () => {
      const formValues = { records: [] };
      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });
      const values = await result.current.actualizeLinks(formValues);

      expect(values).toEqual(formValues);
    });
  });

  describe('when calling actualizeLinks and there are linked fields', () => {
    it('should actualize all links in the correct order', async () => {
      const formValues = {
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: 'test',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            tag: 'LDR',
            content: '05341cam\\a2201021\\i\\4500',
          },
          {
            'tag': '700',
            'content': '$a Wang, Shifu, $d 1260-1316 $0 id.loc.gov/authorities/names/n81003794 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '3929e600-5efb-4427-abf6-a963b01c9c37',
              'authorityNaturalId': 'n81003794',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'indicators': ['1', '\\'],
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '68927bf9-e78f-48b9-a45a-947408caff6e',
              'authorityNaturalId': 'no2005093867',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
        ],
      };

      const linkSuggestionsRequestBody = {
        'leader': formValues.records[0].content,
        'fields': [
          {
            'tag': '700',
            'content': '$a Wang, Shifu, $d 1260-1316 $0 id.loc.gov/authorities/names/n81003794 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
          },
        ],
        'marcFormat': MARC_TYPES.BIB,
        '_actionType': 'view',
      };

      const linkSuggestionsResponse = {
        '_actionType': 'view',
        'leader': formValues.records[0].content,
        'fields': [
          {
            'tag': '700',
            'content': '$a Wang, Shifu, test $d 1260-1316 $0 id.loc.gov/authorities/names/n12345678 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
            'linkDetails': {
              'authorityId': '3929e600-5efb-4427-abf6-a963b01c9c37',
              'authorityNaturalId': 'n12345678',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing test $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing test $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
            'linkDetails': {
              'authorityId': '68927bf9-e78f-48b9-a45a-947408caff6e',
              'authorityNaturalId': 'no2005093867',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
        ],
        'suppressDiscovery': false,
      };

      useLinkSuggestions.mockReturnValue({
        fetchLinkSuggestions: mockFetchLinkSuggestions.mockResolvedValue(linkSuggestionsResponse),
      });

      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const values = await result.current.actualizeLinks(formValues);

      expect(mockFetchLinkSuggestions).toHaveBeenCalledWith({
        body: linkSuggestionsRequestBody,
        isSearchByAuthorityId: true,
        ignoreAutoLinkingEnabled: true,
      });
      expect(values).toEqual({
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: 'test',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            tag: 'LDR',
            content: formValues.records[0].content,
          },
          {
            'tag': '700',
            'content': '$a Wang, Shifu, test $d 1260-1316 $0 id.loc.gov/authorities/names/n12345678 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '3929e600-5efb-4427-abf6-a963b01c9c37',
              'authorityNaturalId': 'n12345678',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'indicators': ['1', '\\'],
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing test $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing test $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '68927bf9-e78f-48b9-a45a-947408caff6e',
              'authorityNaturalId': 'no2005093867',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
        ],
      });
    });
  });

  describe('when calling actualizeLinks and there are linked fields', () => {
    it('should unlink links for which there are no suggestions', async () => {
      const formValues = {
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: '05341cam\\a2201021\\i\\4500',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'indicators': ['1', '\\'],
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
        ],
      };

      const linkSuggestionsResponse = {
        '_actionType': 'view',
        'leader': '05274cam\\a2201021\\i\\4500',
        'fields': [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'linkDetails': {
              'status': 'ERROR',
              'errorCause': '101',
            },
          },
        ],
        'suppressDiscovery': false,
      };

      useLinkSuggestions.mockReturnValue({
        fetchLinkSuggestions: mockFetchLinkSuggestions.mockResolvedValue(linkSuggestionsResponse),
      });

      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const values = await result.current.actualizeLinks(formValues);

      expect(values).toEqual({
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: '05341cam\\a2201021\\i\\4500',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'indicators': ['1', '\\'],
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664',
            'indicators': ['\\', '\\'],
          },
        ],
      });
    });
  });

  describe('when calling actualizeLinks and there are linked fields', () => {
    it('should take controlled subfields from the suggested field and uncontrolled ones from the current field', async () => {
      const formValues = {
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: '05341cam\\a2201021\\i\\4500',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            'tag': '700',
            'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b $2 test1 $i test2',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
        ],
      };

      const linkSuggestionsResponse = {
        '_actionType': 'view',
        'leader': '05274cam\\a2201021\\i\\4500',
        'fields': [
          {
            'tag': '700',
            'content': '$a Yuan, Bing test $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
        ],
        'suppressDiscovery': false,
      };

      useLinkSuggestions.mockReturnValue({
        fetchLinkSuggestions: mockFetchLinkSuggestions.mockResolvedValue(linkSuggestionsResponse),
      });

      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const values = await result.current.actualizeLinks(formValues);

      expect(values).toEqual({
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: '05341cam\\a2201021\\i\\4500',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            'tag': '700',
            'content': '$a Yuan, Bing test $i test2 $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b $2 test1',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
        ],
      });
    });
  });

  describe('when a member tenant calls actualizeLinks and some of the fields linked with shared authority records', () => {
    it('should take suggested fields from central tenant for the fields linked with shared authority records', async () => {
      checkIfUserInMemberTenant.mockReturnValue(true);

      const formValues = {
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: 'test',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            'tag': '700',
            'content': '$a Wang, Shifu, $d 1260-1316 $0 id.loc.gov/authorities/names/n81003794 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '3929e600-5efb-4427-abf6-a963b01c9c37',
              'authorityNaturalId': 'n81003794',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'indicators': ['1', '\\'],
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '68927bf9-e78f-48b9-a45a-947408caff6e',
              'authorityNaturalId': 'no2005093867',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
        ],
      };

      const linkSuggestionsResponse = {
        '_actionType': 'view',
        'leader': formValues.records[0].content,
        'fields': [
          {
            'tag': '700',
            'content': '$a Wang, Shifu, test $d 1260-1316 $0 id.loc.gov/authorities/names/n12345678 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
            'linkDetails': {
              errorCause: '101',
              status: 'ERROR',
            },
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing test $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'linkDetails': {
              errorCause: '101',
              status: 'ERROR',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing test $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
            'linkDetails': {
              errorCause: '101',
              status: 'ERROR',
            },
          },
        ],
        'suppressDiscovery': false,
      };

      const linkSuggestionsResponseFromCentralTenant = {
        '_actionType': 'view',
        'leader': formValues.records[0].content,
        'fields': [
          {
            'tag': '700',
            'content': '$a Wang, Shifu, test $d 1260-1316 $0 id.loc.gov/authorities/names/n12345678 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
            'linkDetails': {
              'authorityId': '3929e600-5efb-4427-abf6-a963b01c9c37',
              'authorityNaturalId': 'n12345678',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'linkDetails': {
              errorCause: '101',
              status: 'ERROR',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing test $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing test $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
            'linkDetails': {
              'authorityId': '68927bf9-e78f-48b9-a45a-947408caff6e',
              'authorityNaturalId': 'no2005093867',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
        ],
        'suppressDiscovery': false,
      };

      useLinkSuggestions.mockReturnValue({
        fetchLinkSuggestions: mockFetchLinkSuggestions
          .mockResolvedValueOnce(linkSuggestionsResponse)
          .mockResolvedValueOnce(linkSuggestionsResponseFromCentralTenant),
      });

      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      const values = await result.current.actualizeLinks(formValues);

      expect(mockFetchLinkSuggestions).toHaveBeenNthCalledWith(1, expect.not.objectContaining({
        tenantId: expect.anything(),
      }));
      expect(mockFetchLinkSuggestions).toHaveBeenNthCalledWith(2, expect.objectContaining({ tenantId: 'consortia' }));

      expect(values).toEqual({
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: 'test',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            'tag': '700',
            'content': '$a Wang, Shifu, test $d 1260-1316 $0 id.loc.gov/authorities/names/n12345678 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '3929e600-5efb-4427-abf6-a963b01c9c37',
              'authorityNaturalId': 'n12345678',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'indicators': ['1', '\\'],
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Yuan, Bing test $0 id.loc.gov/authorities/names/n93100664 $9 a2803a7b-d479-46cd-b744-1305d2a7a29b',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': 'a2803a7b-d479-46cd-b744-1305d2a7a29b',
              'authorityNaturalId': 'n93100664',
              'linkingRuleId': 15,
              'status': 'NEW',
            },
          },
          {
            'tag': '700',
            'content': '$a Zhang, Xuejing test $0 id.loc.gov/authorities/names/no2005093867 $9 68927bf9-e78f-48b9-a45a-947408caff6e',
            'indicators': ['\\', '\\'],
            'linkDetails': {
              'authorityId': '68927bf9-e78f-48b9-a45a-947408caff6e',
              'authorityNaturalId': 'no2005093867',
              'linkingRuleId': 15,
              'status': 'ACTUAL',
            },
          },
        ],
      });
    });
  });

  describe('when a member tenant calls actualizeLinks and some of the fields linked with shared authority records', () => {
    describe('and the suggested field has an error status in both central and member tenants', () => {
      it('should unlink this field', async () => {
        checkIfUserInMemberTenant.mockReturnValue(true);

        const formValues = {
          externalHrid: 'in00000000001',
          externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
          leader: 'test',
          marcFormat: MARC_TYPES.BIB,
          _actionType: 'view',
          records: [
            {
              'tag': '700',
              'content': '$a Wang, Shifu, $d 1260-1316 $0 id.loc.gov/authorities/names/n81003794 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
              'indicators': ['\\', '\\'],
              'linkDetails': {
                'authorityId': '3929e600-5efb-4427-abf6-a963b01c9c37',
                'authorityNaturalId': 'n81003794',
                'linkingRuleId': 15,
                'status': 'ACTUAL',
              },
            },
            {
              'tag': '100',
              'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
              'indicators': ['1', '\\'],
              'linkDetails': {
                'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
                'authorityNaturalId': 'n2008001084',
                'linkingRuleId': 1,
                'status': 'NEW',
              },
            },
          ],
        };

        const linkSuggestionsResponse = {
          '_actionType': 'view',
          'leader': formValues.records[0].content,
          'fields': [
            {
              'tag': '700',
              'content': '$a Wang, Shifu, test $d 1260-1316 $0 id.loc.gov/authorities/names/n12345678 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
              'linkDetails': {
                errorCause: '101',
                status: 'ERROR',
              },
            },
            {
              'tag': '100',
              'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
              'linkDetails': {
                'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
                'authorityNaturalId': 'n2008001084',
                'linkingRuleId': 1,
                'status': 'NEW',
              },
            },
          ],
          'suppressDiscovery': false,
        };

        const linkSuggestionsResponseFromCentralTenant = {
          '_actionType': 'view',
          'leader': formValues.records[0].content,
          'fields': [
            {
              'tag': '700',
              'content': '$a Wang, Shifu, test $d 1260-1316 $0 id.loc.gov/authorities/names/n12345678 $9 3929e600-5efb-4427-abf6-a963b01c9c37',
              'linkDetails': {
                errorCause: '101',
                status: 'ERROR',
              },
            },
            {
              'tag': '100',
              'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
              'linkDetails': {
                errorCause: '101',
                status: 'ERROR',
              },
            },
          ],
          'suppressDiscovery': false,
        };

        useLinkSuggestions.mockReturnValue({
          fetchLinkSuggestions: mockFetchLinkSuggestions
            .mockResolvedValueOnce(linkSuggestionsResponse)
            .mockResolvedValueOnce(linkSuggestionsResponseFromCentralTenant),
        });

        const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

        const values = await result.current.actualizeLinks(formValues);

        expect(values).toEqual({
          externalHrid: 'in00000000001',
          externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
          leader: 'test',
          marcFormat: MARC_TYPES.BIB,
          _actionType: 'view',
          records: [
            {
              'tag': '700',
              'content': '$a Wang, Shifu, $d 1260-1316 $0 id.loc.gov/authorities/names/n81003794',
              'indicators': ['\\', '\\'],
            },
            {
              'tag': '100',
              'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
              'indicators': ['1', '\\'],
              'linkDetails': {
                'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
                'authorityNaturalId': 'n2008001084',
                'linkingRuleId': 1,
                'status': 'NEW',
              },
            },
          ],
        });
      });
    });
  });

  describe('when not a member tenant calls actualizeLinks', () => {
    it('should not call fetchLinkSuggestions for the central tenant', async () => {
      const formValues = {
        externalHrid: 'in00000000001',
        externalId: '4c95c27d-51fc-4ae1-892d-11347377bdd4',
        leader: 'test',
        marcFormat: MARC_TYPES.BIB,
        _actionType: 'view',
        records: [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'indicators': ['1', '\\'],
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
        ],
      };

      const linkSuggestionsResponse = {
        '_actionType': 'view',
        'leader': formValues.records[0].content,
        'fields': [
          {
            'tag': '100',
            'content': '$a Coates, Ta-Nehisi test $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 541539bf-7e1f-468e-a817-a551c6b63d7d',
            'linkDetails': {
              'authorityId': '541539bf-7e1f-468e-a817-a551c6b63d7d',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
          },
        ],
        'suppressDiscovery': false,
      };

      useLinkSuggestions.mockReturnValue({
        fetchLinkSuggestions: mockFetchLinkSuggestions.mockResolvedValue(linkSuggestionsResponse),
      });

      const { result } = renderHook(() => useAuthorityLinking(), { wrapper });

      await result.current.actualizeLinks(formValues);

      expect(mockFetchLinkSuggestions).toHaveBeenCalledTimes(1);
      expect(mockFetchLinkSuggestions).toHaveBeenCalledWith(expect.not.objectContaining({
        tenantId: expect.anything(),
      }));
    });
  });
});
