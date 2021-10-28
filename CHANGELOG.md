# Change history for ui-quick-marc

## [4.0.2](IN PROGRESS)

* [UIQM-161](https://issues.folio.org/browse/UIQM-161) Remove add button for MARC holdings tag 004.
* [UIQM-169](https://issues.folio.org/browse/UIQM-169) Changing 007 type dropdown value does not enable the Save button
* [UIQM-172](https://issues.folio.org/browse/UIQM-172) Changing 006 type dropdown value does not enable the Save button

## [4.0.1](https://github.com/folio-org/ui-quick-marc/tree/v4.0.1) (2021-10-19)

* [UIQM-156](https://issues.folio.org/browse/UIQM-156) Infinite loading after Deriving a new MARC bib record
* [UIQM-144](https://issues.folio.org/browse/UIQM-144) Make 004 field read only when edit a holdings record via quickMARC.
* [UIQM-154](https://issues.folio.org/browse/UIQM-154) Add records-editor.records 1.4 interface version


## [4.0.0](https://github.com/folio-org/ui-quick-marc/tree/v4.0.0) (2021-10-06)

* [UIQM-104](https://issues.folio.org/browse/UIQM-104) Update 007 Type dropdown to display category of material values.
* [UIQM-118](https://issues.folio.org/browse/UIQM-118) MARC record does NOT open after saving an invalid field.
* [UIQM-120](https://issues.folio.org/browse/UIQM-120) Fix bug with saving 006 field with type 's'.
* [UIQM-128](https://issues.folio.org/browse/UIQM-128) Remove leading spaces at the beginning when adding MARC field.
* [UIQM-119](https://issues.folio.org/browse/UIQM-119) Fix removed deleted record value.
* [UIQM-133](https://issues.folio.org/browse/UIQM-133) Edit/Derive quickMARC: Show a toast notification upon clicking Save & Close.
* [UIQM-125](https://issues.folio.org/browse/UIQM-125) Add permission for view, edit MARC holdings record.
* [UIQM-136](https://issues.folio.org/browse/UIQM-136) Update according to API change.
* [UIQM-135](https://issues.folio.org/browse/UIQM-135) Add validation for empty indicators fields.
* [UIQM-134](https://issues.folio.org/browse/UIQM-134) Remove field with empty subfield and content.
* [UIQM-140](https://issues.folio.org/browse/UIQM-140) Auto-populate indicator box with a backslash when Edit or Derive quickMARC record.
* [UIQM-130](https://issues.folio.org/browse/UIQM-130) increment stripes to v7 and react to v17
* [UIQM-124](https://issues.folio.org/browse/UIQM-124) Edit MARC Holdings via quickMARC.
* [UIQM-126](https://issues.folio.org/browse/UIQM-126) Permission: quickMARC:  Create a new MARC holdings record.

## [3.1.0](https://github.com/folio-org/ui-quick-marc/tree/v3.1.0) (2021-06-17)

* [UIQM-86](https://issues.folio.org/browse/UIQM-86) Auto-populate a subfield section with leading $a when no leading subfield is present
* [UIQM-90](https://issues.folio.org/browse/UIQM-90) Add shortcut keys to save a record and to move on search pane.
* [UIQM-92](https://issues.folio.org/browse/UIQM-92) Compile translation files into AST format
* [UIQM-94](https://issues.folio.org/browse/UIQM-94) Display person who last edited quickMARC record.
* [UIQM-95](https://issues.folio.org/browse/UIQM-95) Auto-populate a subfield for 035 and 019 fields when deriving a new record.
* [UIQM-96](https://issues.folio.org/browse/UIQM-96) Update Delete field(s) modal's Cancel button label
* [UIQM-99](https://issues.folio.org/browse/UIQM-99) Remove a row that only has a subfield and no text.
* [UIQM-102](https://issues.folio.org/browse/UIQM-102) Do not auto-populate the 003 field with a leading $a.

## [3.0.2](https://github.com/folio-org/ui-quick-marc/tree/v3.0.2) (2021-06-17)

* [UIQM-105](https://issues.folio.org/browse/UIQM-105) Display MARC Tag 006/00.
* [UIQM-101](https://issues.folio.org/browse/UIQM-101) Updates for editing MARC tag 006 via quickMARC.

## [3.0.1](https://github.com/folio-org/ui-quick-marc/tree/v3.0.1) (2021-04-01)

* [UIQM-83](https://issues.folio.org/browse/UIQM-83) Do not duplicate fields with empty content
* [UIQM-82](https://issues.folio.org/browse/UIQM-82) Add onsave behavior for deriving new MARC bib record
* [UIQM-89](https://issues.folio.org/browse/UIQM-89) Add missing status permission to Derive new MARC bib record permission

## [3.0.0](https://github.com/folio-org/ui-quick-marc/tree/v3.0.0) (2021-03-15)

* [UIQM-67](https://issues.folio.org/browse/UIQM-61) Update display of record status
* [UIQM-72](https://issues.folio.org/browse/UIQM-72) Change delete row behavior
* [UIQM-70](https://issues.folio.org/browse/UIQM-70) Update stripes to v6.0.0
* [UIQM-75](https://issues.folio.org/browse/UIQM-75) Update stripes-cli to v2
* [UIIN-1407](https://issues.folio.org/browse/UIIN-1407) Add Duplicate MARC bib record view
* [UIQM-68](https://issues.folio.org/browse/UIQM-68) Permission: Duplicate and create a new MARC bibliographic record
* [UIQM-76](https://issues.folio.org/browse/UIQM-76) Restore deleted fields when cancelling Save & close.
* [UIQM-66](https://issues.folio.org/browse/UIQM-66) Duplicate a MARC bibliographic record.
* [UIQM-80](https://issues.folio.org/browse/UIQM-80) Rename permission name from Duplicate to Derive new MARC bib record
* [UIQM-78](https://issues.folio.org/browse/UIQM-78) Derive New MARC bib record: Do not copy over 035 and 019 values
* [UIQM-81](https://issues.folio.org/browse/UIQM-81) Rename permission quickMARC: View, edit TO quickMARC: View, edit MARC bibliographic record
* [UIQM-64](https://issues.folio.org/browse/UIQM-64) Add personal data disclosure form

## [2.0.1](https://github.com/folio-org/ui-quick-marc/tree/v2.0.1) (2020-11-11)
[Full Changelog](https://github.com/folio-org/ui-quick-marc/compare/v2.0.0...v2.0.1)

### Bug fixes

* [UIQM-61](https://issues.folio.org/browse/UIQM-61) Make field 005 not editable

## [2.0.0](https://github.com/folio-org/ui-quick-marc/tree/v2.0.0) (2020-10-15)
[Full Changelog](https://github.com/folio-org/ui-quick-marc/compare/v1.1.0...v2.0.0)

### Stories
* [UIQM-50](https://issues.folio.org/browse/UIQM-50) Highlight rows when trash icon selected
* [UIQM-47](https://issues.folio.org/browse/UIQM-47) increment @folio/stripes to v5
* [UIQM-51](https://issues.folio.org/browse/UIQM-51) Quick-Marc | Consume {{FormattedDate}} and {{FormattedTime}} via stripes-component
* Remove bigtest

## [1.1.1](https://github.com/folio-org/ui-quick-marc/tree/v1.1.1) (2020-08-21)
[Full Changelog](https://github.com/folio-org/ui-quick-marc/compare/v1.1.0...v1.1.1)

### Bug fixes

* [UIQM-48](https://issues.folio.org/browse/UIQM-48) quickMARC error message for 006 and 007 character length

## [1.1.0](https://github.com/folio-org/ui-quick-marc/tree/v1.1.0) (2020-08-07)
[Full Changelog](https://github.com/folio-org/ui-quick-marc/compare/v1.0.0...v1.1.0)

### Stories

* [UISACQCOMP-3](https://issues.folio.org/browse/UISACQCOMP-3) Handle import of stripes-acq-components to modules and platform
* [UIQM-42](https://issues.folio.org/browse/UIQM-42) Display quickMARC record's edit status

## [1.0.0](https://github.com/folio-org/ui-quick-marc/tree/v1.0.0) (2020-06-12)

### Stories

* [UIQM-39](https://issues.folio.org/browse/UIQM-39) Save message for Change Manager queue
* [UIQM-31](https://issues.folio.org/browse/UIQM-31) Remove highlighting from quickMARC
* [UIQM-33](https://issues.folio.org/browse/UIQM-33) UI check for Leader and 008 in quickMARC
* [UIQM-23](https://issues.folio.org/browse/UIQM-23) View field 007 by byte in quickMARC
* [UIQM-29](https://issues.folio.org/browse/UIQM-29) Automatically select the contents of the indicator field
* [UIQM-22](https://issues.folio.org/browse/UIQM-22) View field 006 by byte in quickMARC
* [UIQM-26](https://issues.folio.org/browse/UIQM-26) Wrap text in quickMARC
* [UIQM-19](https://issues.folio.org/browse/UIQM-19) Collapse 008 field in quickMARC
* [UIQM-27](https://issues.folio.org/browse/UIQM-27) ui-quick-marc app: Update to Stripes v4
* [UIQM-21](https://issues.folio.org/browse/UIQM-21) UI check for Leader when saving a record in quickMARC
* [UIQM-20](https://issues.folio.org/browse/UIQM-20) Update modal label and message for delete field
* [UIQM-18](https://issues.folio.org/browse/UIQM-18) Reduce margins and white space in quickMARC
* [UIQM-16](https://issues.folio.org/browse/UIQM-16) Edit quickMarc accessibility
* [UIQM-15](https://issues.folio.org/browse/UIQM-15) Add permission translation
* [UIQM-8](https://issues.folio.org/browse/UIQM-8) Save edited record in quickMARC to SRS
* [UIQM-5](https://issues.folio.org/browse/UIQM-5) Reorder field/row in quickMARC
* [UIQM-6](https://issues.folio.org/browse/UIQM-6) Delete a field/row in quickMARC
* [UIQM-2](https://issues.folio.org/browse/UIQM-2) Add a field/row in quickMARC
* [UIQM-13](https://issues.folio.org/browse/UIQM-13) UI check for record type when saving an edited record in quickMARC
* [UIQM-7](https://issues.folio.org/browse/UIQM-7) UI check when saving an edited record in quickMARC
* [UIQM-4](https://issues.folio.org/browse/UIQM-4) Edit the 008 field in quickMARC
* [UIQM-3](https://issues.folio.org/browse/UIQM-3) Edit a record in quickMARC
* [UIQM-9](https://issues.folio.org/browse/UIQM-9) quickMARC permissions
* [UIQC-1](https://issues.folio.org/browse/UIQM-1) Open quickMARC editor from instance record
* [UIQC-10](https://issues.folio.org/browse/UIQM-10) Project Setup: ui-quick-marc

### Bug fixes

* [UIQM-38](https://issues.folio.org/browse/UIQM-38) Missing byte in 007
* [UIQM-37](https://issues.folio.org/browse/UIQM-37) Byte errors in 006 and 007
* [UIQM-34](https://issues.folio.org/browse/UIQM-34) Error when opening quickMARC
