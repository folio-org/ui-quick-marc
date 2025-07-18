const fixedFieldSpecAuth = {
  'tag': '008',
  'format': 'AUTHORITY',
  'label': 'General Information',
  'url': 'https://www.loc.gov/marc/bibliographic/bd008.html',
  'repeatable': false,
  'required': true,
  'spec': {
    'types': [
      {
        'code': 'unknown',
        'identifiedBy': {
          'or': [
            {
              'tag': 'LDR',
              'positions': {
                '6': [
                  'z',
                ],
              },
            },
          ],
        },
        'items': [
          {
            'code': 'Entered',
            'name': 'Date entered on file',
            'order': 0,
            'position': 0,
            'length': 5,
            'isArray': false,
            'readOnly': true,
          },
          {
            'code': 'Geo Subd',
            'name': 'Direct or indirect geographic subdivision',
            'order': 1,
            'position': 6,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'Not subdivided geographically',
              },
              {
                'code': 'd',
                'name': 'Subdivided geographically-direct',
              },
              {
                'code': 'i',
                'name': 'Subdivided geographically-indirect',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Roman',
            'name': 'Romanization scheme',
            'order': 2,
            'position': 7,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'International standard',
              },
              {
                'code': 'b',
                'name': 'National standard',
              },
              {
                'code': 'c',
                'name': 'National library association standard',
              },
              {
                'code': 'd',
                'name': 'National library or bibliographic agency standard',
              },
              {
                'code': 'e',
                'name': 'Local standard',
              },
              {
                'code': 'f',
                'name': 'Standard of unknown origin',
              },
              {
                'code': 'g',
                'name': 'Conventional romanization or conventional form of name in language of cataloging agency',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Lang',
            'name': 'Language of catalog',
            'order': 3,
            'position': 8,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'No information provided',
              },
              {
                'code': 'b',
                'name': 'English and French',
              },
              {
                'code': 'e',
                'name': 'English only',
              },
              {
                'code': 'f',
                'name': 'French only',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Kind rec',
            'name': 'Kind of record',
            'order': 4,
            'position': 9,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Established heading',
              },
              {
                'code': 'b',
                'name': 'Untraced reference',
              },
              {
                'code': 'c',
                'name': 'Traced reference',
              },
              {
                'code': 'd',
                'name': 'Subdivision',
              },
              {
                'code': 'e',
                'name': 'Node label',
              },
              {
                'code': 'f',
                'name': 'Established heading and subdivision',
              },
              {
                'code': 'g',
                'name': 'Reference and subdivision',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Cat Rules',
            'name': 'Descriptive cataloging rules',
            'order': 5,
            'position': 10,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Earlier rules',
              },
              {
                'code': 'b',
                'name': 'AACR 1',
              },
              {
                'code': 'c',
                'name': 'AACR 2',
              },
              {
                'code': 'd',
                'name': 'AACR 2 compatible heading',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'SH Sys',
            'name': 'Subject heading system/thesaurus',
            'order': 6,
            'position': 11,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Library of Congress Subject Headings',
              },
              {
                'code': 'b',
                'name': "Library of Congress Children's and Young Adults' Subject Headings",
              },
              {
                'code': 'c',
                'name': 'Medical Subject Headings',
              },
              {
                'code': 'd',
                'name': 'National Agricultural Library subject authority file',
              },
              {
                'code': 'k',
                'name': 'Canadian Subject Headings',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': 'r',
                'name': 'Art and Architecture Thesaurus',
              },
              {
                'code': 's',
                'name': 'Sears List of Subject Heading',
              },
              {
                'code': 'v',
                'name': 'Répertoire de vedettes-matière',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Series',
            'name': 'Type of series',
            'order': 7,
            'position': 12,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Monographic series',
              },
              {
                'code': 'b',
                'name': 'Multipart item',
              },
              {
                'code': 'c',
                'name': 'Series-like phrase',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Numb Series',
            'name': 'Numbered or unnumbered series',
            'order': 8,
            'position': 13,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Numbered',
              },
              {
                'code': 'b',
                'name': 'Unnumbered',
              },
              {
                'code': 'c',
                'name': 'Numbering varies',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Main use',
            'name': 'Heading use – main or added entry',
            'order': 9,
            'position': 14,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Appropriate',
              },
              {
                'code': 'b',
                'name': 'Not appropriate',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Subj use',
            'name': 'Heading use – subject added entry',
            'order': 10,
            'position': 15,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Appropriate',
              },
              {
                'code': 'b',
                'name': 'Not appropriate',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Series use',
            'name': 'Heading use – series added entry',
            'order': 11,
            'position': 16,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Appropriate',
              },
              {
                'code': 'b',
                'name': 'Not appropriate',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Type Subd',
            'name': 'Type of subject subdivision',
            'order': 12,
            'position': 17,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Topical',
              },
              {
                'code': 'b',
                'name': 'Form',
              },
              {
                'code': 'c',
                'name': 'Chronological',
              },
              {
                'code': 'd',
                'name': 'Geographic',
              },
              {
                'code': 'e',
                'name': 'Language',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Undefined',
            'name': 'Undefined character positions',
            'order': 13,
            'position': 18,
            'length': 10,
            'isArray': false,
            'readOnly': true,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'Undefined',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Govt Ag',
            'name': 'Type of government agency',
            'order': 14,
            'position': 28,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'Not a government agency',
              },
              {
                'code': 'a',
                'name': 'Autonomous or semi-autonomous component',
              },
              {
                'code': 'c',
                'name': 'Multilocal',
              },
              {
                'code': 'f',
                'name': 'Federal/national',
              },
              {
                'code': 'i',
                'name': 'International intergovernmental',
              },
              {
                'code': 'l',
                'name': 'Local',
              },
              {
                'code': 'm',
                'name': 'Multistate',
              },
              {
                'code': 'o',
                'name': 'Government agency-type undetermined',
              },
              {
                'code': 's',
                'name': 'State, provincial, territorial, dependent, etc.',
              },
              {
                'code': 'u',
                'name': 'Unknown if heading is government agency',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'RefEval',
            'name': 'Reference evaluation',
            'order': 15,
            'position': 29,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Tracings are consistent with the heading',
              },
              {
                'code': 'b',
                'name': 'Tracings are not necessarily consistent with the heading',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Undefined',
            'name': 'Undefined character position',
            'order': 16,
            'position': 30,
            'length': 1,
            'isArray': false,
            'readOnly': true,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'Undefined',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'RecUpd',
            'name': 'Record update in process',
            'order': 17,
            'position': 31,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Record can be used',
              },
              {
                'code': 'b',
                'name': 'Record is being updated',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Pers Name',
            'name': 'Undifferentiated personal name',
            'order': 18,
            'position': 32,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Differentiated personal name',
              },
              {
                'code': 'b',
                'name': 'Undifferentiated personal name',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Level Est',
            'name': 'Level of establishment',
            'order': 18,
            'position': 33,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': 'a',
                'name': 'Fully established',
              },
              {
                'code': 'b',
                'name': 'Memorandum',
              },
              {
                'code': 'c',
                'name': 'Provisional',
              },
              {
                'code': 'd',
                'name': 'Preliminary',
              },
              {
                'code': 'n',
                'name': 'Not applicable',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Undefined',
            'name': 'Undefined character positions',
            'order': 18,
            'position': 34,
            'length': 4,
            'isArray': false,
            'readOnly': true,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'Undefined',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Mod Rec Est',
            'name': 'Modified record',
            'order': 18,
            'position': 38,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'Not modified',
              },
              {
                'code': 's',
                'name': 'Shortened',
              },
              {
                'code': 'x',
                'name': 'Missing characters',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
          {
            'code': 'Source',
            'name': 'Cataloging source',
            'order': 18,
            'position': 39,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '\\',
                'name': 'National bibliographic agency',
              },
              {
                'code': 'c',
                'name': 'Cooperative cataloging program',
              },
              {
                'code': 'd',
                'name': 'Other',
              },
              {
                'code': 'u',
                'name': 'Unknown',
              },
              {
                'code': '|',
                'name': 'No attempt to code',
              },
            ],
          },
        ],
      },
    ],
  },
};

export default fixedFieldSpecAuth;
