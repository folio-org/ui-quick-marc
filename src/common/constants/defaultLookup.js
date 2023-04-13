import { searchableIndexesValues } from './searchableIndexesValues';

const CORPORATE_CONFERENCE_NAME_SET = {
  dropdownValue: searchableIndexesValues.CORPORATE_CONFERENCE_NAME,
};

const UNIFORM_TITLE_SET = {
  dropdownValue: searchableIndexesValues.UNIFORM_TITLE,
};

const PERSONAL_NAME_SET = {
  dropdownValue: searchableIndexesValues.PERSONAL_NAME,
};

export const DEFAULT_LOOKUP_OPTIONS = {
  100: PERSONAL_NAME_SET,
  110: CORPORATE_CONFERENCE_NAME_SET,
  111: CORPORATE_CONFERENCE_NAME_SET,
  130: UNIFORM_TITLE_SET,
  240: {
    dropdownValue: searchableIndexesValues.NAME_TITLE,
  },
  600: PERSONAL_NAME_SET,
  610: CORPORATE_CONFERENCE_NAME_SET,
  611: CORPORATE_CONFERENCE_NAME_SET,
  630: UNIFORM_TITLE_SET,
  650: {
    dropdownValue: searchableIndexesValues.SUBJECT,
  },
  651: {
    dropdownValue: searchableIndexesValues.GEOGRAPHIC_NAME,
  },
  655: {
    dropdownValue: searchableIndexesValues.GENRE,
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
