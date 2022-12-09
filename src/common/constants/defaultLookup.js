import { searchableIndexesValues } from '@folio/stripes-authority-components/lib/constants/searchableIndexesValues';

const filters = ['af045f2f-e851-4613-984c-4bc13430454a'];

const CORPORATE_CONFERENCE_NAME_SET = {
  dropdownValue: searchableIndexesValues.CORPORATE_CONFERENCE_NAME,
  filters,
};

const UNIFORM_TITLE_SET = {
  dropdownValue: searchableIndexesValues.UNIFORM_TITLE,
  filters,
};

const PERSONAL_NAME_SET = {
  dropdownValue: searchableIndexesValues.PERSONAL_NAME,
  filters,
};

export const DEFAULT_LOOKUP_OPTIONS = {
  100: PERSONAL_NAME_SET,
  110: CORPORATE_CONFERENCE_NAME_SET,
  111: CORPORATE_CONFERENCE_NAME_SET,
  130: UNIFORM_TITLE_SET,
  240: {
    dropdownValue: searchableIndexesValues.NAME_TITLE,
    filters,
  },
  600: PERSONAL_NAME_SET,
  610: CORPORATE_CONFERENCE_NAME_SET,
  611: CORPORATE_CONFERENCE_NAME_SET,
  630: UNIFORM_TITLE_SET,
  650: {
    dropdownValue: searchableIndexesValues.SUBJECT,
    filters: ['837e2c7b-037b-4113-9dfd-b1b8aeeb1fb8'],
  },
  651: {
    dropdownValue: searchableIndexesValues.GEOGRAPHIC_NAME,
    filters,
  },
  655: {
    dropdownValue: searchableIndexesValues.GENRE,
    filters: ['67d1ec4b-a19a-4324-9f19-473b49e370ac'],
  },
  700: PERSONAL_NAME_SET,
  710: CORPORATE_CONFERENCE_NAME_SET,
  711: CORPORATE_CONFERENCE_NAME_SET,
  730: UNIFORM_TITLE_SET,
  800: PERSONAL_NAME_SET,
  810: CORPORATE_CONFERENCE_NAME_SET,
  811: CORPORATE_CONFERENCE_NAME_SET,
  830: UNIFORM_TITLE_SET,
};
