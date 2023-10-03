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
        code: 'maps',
        identifiedBy: {
          or: [
            {
              tag: 'LDR',
              positions: {
                6: ['e', 'f'],
              },
            },
          ],
        },
        items: [],
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
