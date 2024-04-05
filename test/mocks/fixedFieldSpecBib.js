/* eslint-disable max-lines */
const fixedFieldSpecBib = {
  tag: '008',
  spec: {
    types: [
      {
        code: 'books',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['a'],
                7: ['a', 'c', 'd', 'm'],
              },
            },
            {
              tag: 'LDR',
              positions: {
                6: ['t'],
              },
            },
          ],
        },
        items: [
          {
            code: 'Entered',
            name: 'Date entered on file',
            order: 0,
            position: 0,
            length: 5,
            isArray: false,
            readOnly: true,
          },
          {
            code: 'DtSt',
            name: 'Type of date/Publication status',
            order: 1,
            position: 6,
            length: 1,
            isArray: false,
            readOnly: false,
            allowedValues: [
              { code: '|', name: 'No attempt to code' },
              { code: 'b', name: 'No dates given; B.C. date involved' },
              { code: 'c', name: 'Continuing resource currently published' },
              { code: 'd', name: 'Continuing resource ceased publication' },
              { code: 'e', name: 'Detailed date' },
              { code: 'i', name: 'Inclusive dates of collection' },
              { code: 'k', name: 'Range of years of bulk of collection' },
              { code: 'm', name: 'Multiple dates' },
              { code: 'n', name: 'Dates unknown' },
              { code: 'p', name: 'Date of distribution/release/issue and production/recording session when different' },
              { code: 'q', name: 'Questionable date' },
              { code: 'r', name: 'Reprint/reissue date and original date' },
              { code: 's', name: 'Single known date/probable date' },
              { code: 't', name: 'Publication date and copyright date' },
              { code: 'u', name: 'Continuing resource status unknown' },
            ],
          },
          {
            code: 'Date1',
            name: 'Start date',
            order: 2,
            position: 7,
            length: 4,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Date2',
            name: 'End date',
            order: 3,
            position: 11,
            length: 4,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Ctry',
            name: 'Place of publication, production, or execution',
            order: 4,
            position: 15,
            length: 3,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Ills',
            name: 'Illustrations',
            order: 5,
            position: 18,
            length: 4,
            isArray: true,
            readOnly: false,
            allowedValues: [
              { code: '|', name: 'No attempt to code' },
              { code: '\\', name: 'No illustrations' },
              { code: 'a', name: 'Illustrations' },
              { code: 'b', name: 'Maps' },
              { code: 'c', name: 'Portraits' },
              { code: 'd', name: 'Charts' },
              { code: 'e', name: 'Plans' },
              { code: 'f', name: 'Plates' },
              { code: 'g', name: 'Music' },
              { code: 'h', name: 'Facsimiles' },
              { code: 'i', name: 'Coats of arms' },
              { code: 'j', name: 'Genealogical tables' },
              { code: 'k', name: 'Forms' },
              { code: 'l', name: 'Samples' },
              { code: 'm', name: 'Phonodisc, phonowire, etc.' },
              { code: 'o', name: 'Photographs' },
              { code: 'p', name: 'Illuminations' },
            ],
          },
          {
            code: 'Audn',
            name: 'Target audience',
            order: 6,
            position: 22,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Form',
            name: 'Form of item',
            order: 7,
            position: 23,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Cont',
            name: 'Nature of contents',
            order: 8,
            position: 24,
            length: 4,
            isArray: true,
            readOnly: false,
          },
          {
            code: 'GPub',
            name: 'Government publication',
            order: 9,
            position: 28,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Conf',
            name: 'Conference publication',
            order: 10,
            position: 29,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Fest',
            name: 'Festschrift',
            order: 11,
            position: 30,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Indx',
            name: 'Index',
            order: 12,
            position: 31,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Und',
            name: 'Undefined',
            order: 13,
            position: 32,
            length: 1,
            isArray: false,
            readOnly: true,
          },
          {
            code: 'LitF',
            name: 'Literary form',
            order: 14,
            position: 33,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Biog',
            name: 'Biography',
            order: 15,
            position: 34,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Lang',
            name: 'Language',
            order: 16,
            position: 35,
            length: 3,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'MRec',
            name: 'Modified record',
            order: 17,
            position: 38,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Srce',
            name: 'Cataloging source',
            order: 18,
            position: 39,
            length: 1,
            isArray: false,
            readOnly: false,
          },
        ],
      },
      {
        code: 'scores',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['c', 'd'],
              },
            },
          ],
        },
        items: [],
      },
      {
        code: 'sound_recordings',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['i', 'j'],
              },
            },
          ],
        },
        items: [],
      },
      {
        code: 'continuing_resources',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['a'],
                7: ['b', 'i', 's'],
              },
            },
            {
              tag: 'LDR',
              positions: {
                6: ['s'],
              },
            },
          ],
        },
        items: [],
      },
      {
        code: 'computer_files',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['m'],
              },
            },
          ],
        },
        items: [],
      },
      {
        code: 'visual_materials',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['g', 'k', 'o', 'r'],
              },
            },
          ],
        },
        items: [
          {
            code: 'Entered',
            name: 'Date entered on file',
            order: 0,
            position: 0,
            length: 5,
            isArray: false,
            readOnly: true,
          },
          {
            code: 'DtSt',
            name: 'Type of date/Publication status',
            order: 1,
            position: 6,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Date1',
            name: 'Start date',
            order: 2,
            position: 7,
            length: 4,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Date2',
            name: 'End date',
            order: 3,
            position: 11,
            length: 4,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Ctry',
            name: 'Place of publication, production, or execution',
            order: 4,
            position: 15,
            length: 3,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Time',
            name: 'Running time for motion pictures and videorecordings',
            order: 5,
            position: 18,
            length: 3,
            isArray: true,
            readOnly: false,
          },
          {
            code: 'Und',
            name: 'Undefined',
            order: 6,
            position: 21,
            length: 1,
            isArray: false,
            readOnly: true,
          },
          {
            code: 'Audn',
            name: 'Target audience',
            order: 7,
            position: 22,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Und',
            name: 'Undefined',
            order: 8,
            position: 23,
            length: 5,
            isArray: false,
            readOnly: true,
          },
          {
            code: 'GPub',
            name: 'Government publication',
            order: 9,
            position: 28,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Form',
            name: 'Form of item',
            order: 10,
            position: 29,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Und',
            name: 'Undefined',
            order: 11,
            position: 30,
            length: 3,
            isArray: false,
            readOnly: true,
          },
          {
            code: 'TMat',
            name: 'Type of visual material',
            order: 12,
            position: 33,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Tech',
            name: 'Technique',
            order: 13,
            position: 34,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Lang',
            name: 'Language',
            order: 14,
            position: 35,
            length: 3,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'MRec',
            name: 'Modified record',
            order: 15,
            position: 38,
            length: 1,
            isArray: false,
            readOnly: false,
          },
          {
            code: 'Srce',
            name: 'Cataloging source',
            order: 16,
            position: 39,
            length: 1,
            isArray: false,
            readOnly: false,
          },
        ],
      },
      {
        'code': 'maps',
        'identifiedBy': {
          'or': [
            {
              'tag': 'LDR',
              'positions': {
                '6': ['e', 'f'],
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
            'code': 'DtSt',
            'name': 'Type of date/Publication status',
            'order': 1,
            'position': 6,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': 'b',
                'name': 'No dates given; B.C. date involved',
              },
              {
                'code': 'c',
                'name': 'Continuing resource currently published',
              },
              {
                'code': 'd',
                'name': 'Continuing resource ceased publication',
              },
              {
                'code': 'e',
                'name': 'Detailed date',
              },
              {
                'code': 'i',
                'name': 'Inclusive dates of collection',
              },
              {
                'code': 'k',
                'name': 'Range of years of bulk of collection',
              },
              {
                'code': 'm',
                'name': 'Multiple dates',
              },
              {
                'code': 'n',
                'name': 'Dates unknown',
              },
              {
                'code': 'p',
                'name': 'Date of distribution/release/issue and production/recording session when different',
              },
              {
                'code': 'q',
                'name': 'Questionable date',
              },
              {
                'code': 'r',
                'name': 'Reprint/reissue date and original date',
              },
              {
                'code': 's',
                'name': 'Single known date/probable date',
              },
              {
                'code': 't',
                'name': 'Publication date and copyright date',
              },
              {
                'code': 'u',
                'name': 'Continuing resource status unknown',
              },
            ],
          },
          {
            'code': 'Date1',
            'name': 'Start date',
            'order': 2,
            'position': 7,
            'length': 4,
            'isArray': false,
            'readOnly': false,
          },
          {
            'code': 'Date2',
            'name': 'End date',
            'order': 3,
            'position': 11,
            'length': 4,
            'isArray': false,
            'readOnly': false,
          },
          {
            'code': 'Ctry',
            'name': 'Place of publication, production, or execution',
            'order': 4,
            'position': 15,
            'length': 3,
            'isArray': false,
            'readOnly': false,
          },
          {
            'code': 'Relf',
            'name': 'Relief',
            'order': 5,
            'position': 18,
            'length': 4,
            'isArray': true,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': '\\',
                'name': 'No relief shown',
              },
              {
                'code': 'a',
                'name': 'Contours',
              },
              {
                'code': 'b',
                'name': 'Shading',
              },
              {
                'code': 'c',
                'name': 'Gradient and bathymetric tints',
              },
              {
                'code': 'd',
                'name': 'Hachures',
              },
              {
                'code': 'e',
                'name': 'Bathymetry/soundings',
              },
              {
                'code': 'f',
                'name': 'Form lines',
              },
              {
                'code': 'g',
                'name': 'Spot heights',
              },
              {
                'code': 'i',
                'name': 'Pictorially',
              },
              {
                'code': 'j',
                'name': 'Land forms',
              },
              {
                'code': 'k',
                'name': 'Bathymetry/isolines',
              },
              {
                'code': 'm',
                'name': 'Rock drawings',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
            ],
          },
          {
            'code': 'Proj',
            'name': 'Projection',
            'order': 6,
            'position': 22,
            'length': 2,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '||',
                'name': 'No attempt to code',
              },
              {
                'code': '\\\\',
                'name': 'Projection not specified',
              },
              {
                'code': 'aa',
                'name': 'Aitoff',
              },
              {
                'code': 'ab',
                'name': 'Gnomic',
              },
              {
                'code': 'ac',
                'name': "Lambert's azimuthal equal area",
              },
              {
                'code': 'ad',
                'name': 'Orthographic',
              },
              {
                'code': 'ae',
                'name': 'Azimuthal equidistant',
              },
              {
                'code': 'af',
                'name': 'Stereographic',
              },
              {
                'code': 'ag',
                'name': 'General vertical near-sided',
              },
              {
                'code': 'am',
                'name': 'Modified stereographic for Alaska',
              },
              {
                'code': 'an',
                'name': 'Chamberlin trimetric',
              },
              {
                'code': 'ap',
                'name': 'Polar stereographic',
              },
              {
                'code': 'au',
                'name': 'Azimuthal, specific type unknown',
              },
              {
                'code': 'az',
                'name': 'Azimuthal, other',
              },
              {
                'code': 'ba',
                'name': 'Gall',
              },
              {
                'code': 'bb',
                'name': "Goode's homolographic",
              },
              {
                'code': 'bc',
                'name': "Lambert's cylindrical equal area",
              },
              {
                'code': 'bd',
                'name': 'Mercator',
              },
              {
                'code': 'be',
                'name': 'Miller',
              },
              {
                'code': 'bf',
                'name': 'Mollweide',
              },
              {
                'code': 'bg',
                'name': 'Sinusoidal',
              },
              {
                'code': 'bh',
                'name': 'Transverse Mercator',
              },
              {
                'code': 'bi',
                'name': 'Gauss-Kruger',
              },
              {
                'code': 'bj',
                'name': 'Equirectangular',
              },
              {
                'code': 'bk',
                'name': 'Krovak',
              },
              {
                'code': 'bl',
                'name': 'Cassini-Soldner',
              },
              {
                'code': 'bo',
                'name': 'Oblique Mercator',
              },
              {
                'code': 'br',
                'name': 'Robinson',
              },
              {
                'code': 'bs',
                'name': 'Space oblique Mercator',
              },
              {
                'code': 'bu',
                'name': 'Cylindrical, specific type unknown',
              },
              {
                'code': 'bz',
                'name': 'Cylindrical, other',
              },
              {
                'code': 'ca',
                'name': 'Albers equal area',
              },
              {
                'code': 'cb',
                'name': 'Bonne',
              },
              {
                'code': 'cc',
                'name': "Lambert's conformal conic",
              },
              {
                'code': 'ce',
                'name': 'Equidistant conic',
              },
              {
                'code': 'cp',
                'name': 'Polyconic',
              },
              {
                'code': 'cu',
                'name': 'Conic, specific type unknown',
              },
              {
                'code': 'cz',
                'name': 'Conic, other',
              },
              {
                'code': 'da',
                'name': 'Armadillo',
              },
              {
                'code': 'db',
                'name': 'Butterfly',
              },
              {
                'code': 'dc',
                'name': 'Eckert',
              },
              {
                'code': 'dd',
                'name': "Goode's homolosine",
              },
              {
                'code': 'de',
                'name': "Miller's bipolar oblique conformal conic",
              },
              {
                'code': 'df',
                'name': 'Van Der Grinten',
              },
              {
                'code': 'dg',
                'name': 'Dimaxion',
              },
              {
                'code': 'dh',
                'name': 'Cordiform',
              },
              {
                'code': 'dl',
                'name': 'Lambert conformal',
              },
              {
                'code': 'zz',
                'name': 'Other',
              },
            ],
          },
          {
            'code': 'Und',
            'name': 'Undefined',
            'order': 7,
            'position': 24,
            'length': 1,
            'isArray': false,
            'readOnly': true,
          },
          {
            'code': 'CrTp',
            'name': 'Type of cartographic material',
            'order': 8,
            'position': 25,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': 'a',
                'name': 'Single map',
              },
              {
                'code': 'b',
                'name': 'Map series',
              },
              {
                'code': 'c',
                'name': 'Map serial',
              },
              {
                'code': 'd',
                'name': 'Globe',
              },
              {
                'code': 'e',
                'name': 'Atlas',
              },
              {
                'code': 'f',
                'name': 'Separate supplement to another work',
              },
              {
                'code': 'g',
                'name': 'Bound as part of another work',
              },
              {
                'code': 'u',
                'name': 'Unknown',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
            ],
          },
          {
            'code': 'Und',
            'name': 'Undefined',
            'order': 9,
            'position': 26,
            'length': 2,
            'isArray': false,
            'readOnly': true,
          },
          {
            'code': 'GPub',
            'name': 'Government publication',
            'order': 10,
            'position': 28,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': '\\',
                'name': 'Not a government publication',
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
                'name': 'Government publication-level undetermined',
              },
              {
                'code': 's',
                'name': 'State, provincial, territorial, dependent, etc.',
              },
              {
                'code': 'u',
                'name': 'Unknown if item is government publication',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
            ],
          },
          {
            'code': 'Form',
            'name': 'Form of item',
            'order': 11,
            'position': 29,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': '\\',
                'name': 'None of the following',
              },
              {
                'code': 'a',
                'name': 'Microfilm',
              },
              {
                'code': 'b',
                'name': 'Microfiche',
              },
              {
                'code': 'c',
                'name': 'Microopaque',
              },
              {
                'code': 'd',
                'name': 'Large print',
              },
              {
                'code': 'f',
                'name': 'Braille',
              },
              {
                'code': 'o',
                'name': 'Online',
              },
              {
                'code': 'q',
                'name': 'Direct electronic',
              },
              {
                'code': 'r',
                'name': 'Regular print reproduction',
              },
              {
                'code': 's',
                'name': 'Electronic',
              },
            ],
          },
          {
            'code': 'Und',
            'name': 'Undefined',
            'order': 12,
            'position': 30,
            'length': 1,
            'isArray': false,
            'readOnly': true,
          },
          {
            'code': 'Indx',
            'name': 'Index',
            'order': 13,
            'position': 31,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': '0',
                'name': 'No index',
              },
              {
                'code': '1',
                'name': 'Index present',
              },
            ],
          },
          {
            'code': 'Und',
            'name': 'Undefined',
            'order': 14,
            'position': 32,
            'length': 1,
            'isArray': false,
            'readOnly': true,
          },
          {
            'code': 'SpFm',
            'name': 'Special format characteristics',
            'order': 15,
            'position': 33,
            'length': 2,
            'isArray': true,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': '\\',
                'name': 'No specified special format characteristics',
              },
              {
                'code': 'e',
                'name': 'Manuscript',
              },
              {
                'code': 'j',
                'name': 'Picture card, post card',
              },
              {
                'code': 'k',
                'name': 'Calendar',
              },
              {
                'code': 'l',
                'name': 'Puzzle',
              },
              {
                'code': 'n',
                'name': 'Game',
              },
              {
                'code': 'o',
                'name': 'Wall map',
              },
              {
                'code': 'p',
                'name': 'Playing cards',
              },
              {
                'code': 'r',
                'name': 'Loose-leaf',
              },
              {
                'code': 'z',
                'name': 'Other',
              },
            ],
          },
          {
            'code': 'Lang',
            'name': 'Language',
            'order': 16,
            'position': 35,
            'length': 3,
            'isArray': false,
            'readOnly': false,
          },
          {
            'code': 'MRec',
            'name': 'Modified record',
            'order': 17,
            'position': 38,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
              {
                'code': '\\',
                'name': 'Not modified',
              },
              {
                'code': 'd',
                'name': 'Dashed-on information omitted',
              },
              {
                'code': 'o',
                'name': 'Completely romanized/printed cards romanized',
              },
              {
                'code': 'r',
                'name': 'Completely romanized/printed cards in script',
              },
              {
                'code': 's',
                'name': 'Shortened',
              },
              {
                'code': 'x',
                'name': 'Missing characters',
              },
            ],
          },
          {
            'code': 'Srce',
            'name': 'Cataloging source',
            'order': 18,
            'position': 39,
            'length': 1,
            'isArray': false,
            'readOnly': false,
            'allowedValues': [
              {
                'code': '|',
                'name': 'No attempt to code',
              },
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
            ],
          },
        ],
      },
      {
        code: 'mixed_materials',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['p'],
              },
            },
          ],
        },
        items: [],
      },
    ],
  },
};

export default fixedFieldSpecBib;
