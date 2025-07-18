# Change history for ui-quick-marc

## [11.0.0] (IN PROGRESS)

* [UIQM-762](https://issues.folio.org/browse/UIQM-762) Select a MARC authority record - Update auto-populate Advanced search and Browse queries with all controlled subfields.
* [UIQM-744](https://issues.folio.org/browse/UIQM-744) Remove "Create a" text from the paneheader when creating new authority, bib, and holdings records.
* [UIQM-773](https://issues.folio.org/browse/UIQM-773) Use Central tenant linking rules when user editing Shared MARC bib from Central or Member tenant.
* [UIQM-777](https://issues.folio.org/browse/UIQM-777) Support validation of MARC Holdings records with location codes that have a whitespace.
* [UIQM-778](https://issues.folio.org/browse/UIQM-778) *BREAKING* Update for Split Search & Browse APIs.
* [UIQM-398](https://issues.folio.org/browse/UIQM-398) Create\Edit quickMARC Authority: Add 008 position dropdowns to display available values.

## [10.0.3](https://github.com/folio-org/ui-quick-marc/tree/v10.0.3) (2025-06-30)

* [UIQM-771](https://issues.folio.org/browse/UIQM-771) FE | Support Create/Update action for MARC holdings record on shared Instance from member tenant on ECS environment.

## [10.0.2](https://github.com/folio-org/ui-quick-marc/tree/v10.0.2) (2025-04-29)

* [UIQM-768](https://issues.folio.org/browse/UIQM-768) Switch to local record when deriving a shared MARC Bib record in a member tenant.

## [10.0.1](https://github.com/folio-org/ui-quick-marc/tree/v10.0.1) (2025-04-16)

* [UIQM-765](https://issues.folio.org/browse/UIQM-765) Add `shared=true` parameter to url when a user saves and keeps editing a Bib/Authority record on a central tenant.
* [UIQM-766](https://issues.folio.org/browse/UIQM-766) useSaveRecord - do not use central tenant id when deriving a shared record from a member tenant.

## [10.0.0](https://github.com/folio-org/ui-quick-marc/tree/v10.0.0) (2025-03-13)

* [UIQM-716](https://issues.folio.org/browse/UIQM-716) *BREAKING* Consolidate routes based on MARC type for bib and authority records to avoid page refresh after redirecting from the create page to the edit one.
* [UIQM-730](https://issues.folio.org/browse/UIQM-730) Create/Edit/Derive MARC record - Retain focus when MARC record validation rules error display. Show validation issues toasts.
* [UIQM-740](https://issues.folio.org/browse/UIQM-740) Don't show warn/fail error toasts when there are no warns/fails.
* [UIQM-728](https://issues.folio.org/browse/UIQM-728) Keep focus on last focused element when user cancels on confirmation modals.
* [UIQM-743](https://issues.folio.org/browse/UIQM-743) Prevent `handleSubmit` from running if there is any validation issue, instead of using the `complete` form API.
* [UIQM-754](https://issues.folio.org/browse/UIQM-754) Replace the source file lookup modal with a dropdown.
* [UIQM-751](https://issues.folio.org/browse/UIQM-751) *BREAKING* migrate stripes dependencies to their Sunflower versions.
* [UIQM-752](https://issues.folio.org/browse/UIQM-752) *BREAKING* migrate react-intl to v7.
* [UIQM-659](https://issues.folio.org/browse/UIQM-659) React v19: refactor away from default props for functional components.
* [UIQM-761](https://issues.folio.org/browse/UIQM-761) Add `audit.config.groups.settings.collection.get` permission for `quickMARC: View MARC bibliographic record`.

## [9.0.2] (IN PROGRESS)

* [UIQM-726](https://issues.folio.org/browse/UIQM-726) Use a larger width of 7-16 leader positions field.

## [9.0.1](https://github.com/folio-org/ui-quick-marc/tree/v9.0.1) (2024-11-22)

* [UIQM-725](https://issues.folio.org/browse/UIQM-725) Fix wrong error message while saving MARC Bib record with invalid LDR position values.

## [9.0.0](https://github.com/folio-org/ui-quick-marc/tree/v9.0.0) (2024-11-01)

* [UIQM-647](https://issues.folio.org/browse/UIQM-647) Import `useUserTenantPermissions` from `@folio/stripes/core`.
* [UIQM-563](https://issues.folio.org/browse/UIQM-563) Allow a user to move 00X fields.
* [UIQM-563](https://issues.folio.org/browse/UIQM-655) Add a `required` property to `Select` type fields for screen readers.
* [UIQM-648](https://issues.folio.org/browse/UIQM-648) Add `aria-label` to the location field.
* [UIQM-660](https://issues.folio.org/browse/UIQM-660) *BREAKING* Added `stripes-inventory-components` to peerDeps. Added inventory search link next to 010 fields.
* [UIQM-671](https://issues.folio.org/browse/UIQM-671) Create/Derive a MARC bib/holdings/authority > Remove the add new field on the system generated 999 ff.
* [UIQM-661](https://issues.folio.org/browse/UIQM-661) Derive a new MARC bib record > Do not copy over 010 field values.
* [UIQM-666](https://issues.folio.org/browse/UIQM-666) Make leader positions `Type` and `BLvl` required when creating a bib record.
* [UIQM-672](https://issues.folio.org/browse/UIQM-672) Add a tooltip for the search link.
* [UIQM-670](https://issues.folio.org/browse/UIQM-670) Allow saving local control fields without subfield.
* [UIQM-669](https://issues.folio.org/browse/UIQM-669) Display validation error messages inline.
* [UIQM-658](https://issues.folio.org/browse/UIQM-658) Check for duplicate LCCN (010 $a) bib or authority records.
* [UIQM-631](https://issues.folio.org/browse/UIQM-631) Create/Edit/Derive a MARC bib/authority/holdings record > Display MARC record validation errors inline.
* [UIQM-632](https://issues.folio.org/browse/UIQM-632) Run timer on submit during backend validation, if it takes over 2s, show modal.
* [UIQM-681](https://issues.folio.org/browse/UIQM-681) Return some validation rules for Bib and Authority records.
* [UIQM-685](https://issues.folio.org/browse/UIQM-685) “ELvl” box (17th LDR position) validation when Creating/Editing/Deriving MARC bib.
* [UIQM-688](https://issues.folio.org/browse/UIQM-688) Convert Leader from Object to string when fetching links autosuggestions.
* [UIQM-687](https://issues.folio.org/browse/UIQM-687) Create/Derive MARC Bib records - remove field 001 error related to missing field during validation.
* [UIQM-686](https://issues.folio.org/browse/UIQM-686) Return removed UI validation in "quickmarc".
* [UIQM-690](https://issues.folio.org/browse/UIQM-690) Match payload formatting for submit and validate when editing.
* [UIQM-668](https://issues.folio.org/browse/UIQM-668) Change "subfield" to "position" in 008 validation messages.
* [UIQM-691](https://issues.folio.org/browse/UIQM-691) Show correct field and toast color when validation returns warnings.
* [UIQM-665](https://issues.folio.org/browse/UIQM-665) Fix to generate array content in 008 after changing document type of MARC bib.
* [UIQM-694](https://issues.folio.org/browse/UIQM-694) Separate error messages triggered by controlled subfields of different linked fields.
* [UIQM-592](https://issues.folio.org/browse/UIQM-592) Fix to input polish special chars into fields.
* [UIQM-697](https://issues.folio.org/browse/UIQM-697) Field 008: Validate the length of subfields. Add backslashes if the length of a subfield of field 008 is shorter, if longer - cut off the extra characters.
* [UIQM-699](https://issues.folio.org/browse/UIQM-699) ECS - send validation request with central tenant id for shared Bib and Authority records.
* [UIQM-693](https://issues.folio.org/browse/UIQM-693) Hide permission - Edit, View: Enable duplicate LCCN (010 $a) checking of MARC bibliographic and authority records.
* [UIQM-695](https://issues.folio.org/browse/UIQM-695) Remove extra `$` from error messages when adding/removing `$t` from 1XX of linked MARC authority record.
* [UIQM-706](https://issues.folio.org/browse/UIQM-706) *BREAKING* Upgrade `marc-records-editor` to `6.0`.
* [UIQM-698](https://issues.folio.org/browse/UIQM-698) Validate 006/007 field lengths.
* [UIQM-704](https://issues.folio.org/browse/UIQM-704) Linked fields - combine split fields before sending for validation.
* [UIQM-708](https://issues.folio.org/browse/UIQM-708) Change 007 Microforms type to allow 4 characters in RRR/RR field.
* [UIQM-714](https://issues.folio.org/browse/UIQM-714) *BREAKING* Upgrade `inventory` to `14.0`.
* [UIQM-709](https://issues.folio.org/browse/UIQM-709) LCCN duplication: Update the bib request query to include only the non-suppressed record in the search results.
* [UIQM-701](https://issues.folio.org/browse/UIQM-701) Use new GA workflows.
* [UIQM-711](https://issues.folio.org/browse/UIQM-711) Update `validateFixedFieldPositions` to display all 008 field errors instead of one in Bibliographic records.
* [UIQM-712](https://issues.folio.org/browse/UIQM-712) In field 007 for Projected Graphic type: change the `MfS` field type to `Byte` to allow only 1 character to be entered.
* [UIQM-715](https://issues.folio.org/browse/UIQM-715) Reuse existing ids for fields after saving a record to avoid re-rendering and be able to focus on a field by ref.
* [UIQM-723](https://issues.folio.org/browse/UIQM-723) Rename permissions.
* [UIQM-724](https://issues.folio.org/browse/UIQM-724) Do not group together subfields during linking.

## [8.0.2] (https://github.com/folio-org/ui-quick-marc/tree/v8.0.2) (2024-12-02)

* [UIQM-735](https://issues.folio.org/browse/UIQM-735) Return also sub permissions in `useUserTenantPermissions` hook.

## [8.0.1] (https://github.com/folio-org/ui-quick-marc/tree/v8.0.1) (2024-04-18)

* [UIQM-641](https://issues.folio.org/browse/UIQM-641) Call `cleanBytesFields` function with correct arguments to fix 008 field.
* [UIQM-640](https://issues.folio.org/browse/UIQM-640) Create authority | Make list of authority files in lookup alphabetical.
* [UIQM-650](https://issues.folio.org/browse/UIQM-650) Use `setTimeout` to defer the execution of `showCallout` to ensure the toasts are shown after the potentially heavy render.
* [UIQM-649](https://issues.folio.org/browse/UIQM-649) Added validation rule to prevent deletion of 010 when it is a linking point.

## [8.0.0](https://github.com/folio-org/ui-quick-marc/tree/v8.0.0) (2024-03-21)

* [UIQM-580](https://issues.folio.org/browse/UIQM-580) *BREAKING* Move QuickMarcView, PrintPopup and getHeaders to stripes-marc-components.
* [UIQM-543](https://issues.folio.org/browse/UIQM-543) Remove eslint deps that are already listed in eslint-config-stripes.
* [UIQM-573](https://issues.folio.org/browse/UIQM-573) Edit MARC authority | Allow user to Add/Edit 010 $a when linking is based on 001.
* [UIQM-574](https://issues.folio.org/browse/UIQM-574) Added authority source file selection button and modal to Authority Create view.
* [UIQM-591](https://issues.folio.org/browse/UIQM-591) Show permission `quickMARC: Create a new MARC authority record`. Don't load locations when MARC type is not Holdings.
* [UIQM-594](https://issues.folio.org/browse/UIQM-594) *BREAKING* Add authority-source-files interface.
* [UIQM-522](https://issues.folio.org/browse/UIQM-522) Create/Derive a new MARC bib record & Create a MARC holdings | Default state of Save & close button should be disabled.
* [UIQM-534](https://issues.folio.org/browse/UIQM-534) Remove fields that have no MARC tag and no subfield value.  
* [UIQM-381](https://issues.folio.org/browse/UIQM-381) Create Orig Authority Record: Populate new record with default Leader values.
* [UIQM-526](https://issues.folio.org/browse/UIQM-526) Refactor validation functionality.
* [UIQM-597](https://issues.folio.org/browse/UIQM-597) Build initial values for the find-authority plugin using EXACT_PHRASE when there is '$0' value.
* [UIQM-595](https://issues.folio.org/browse/UIQM-595) During linking, take the authority subfields first and then the bib subfields.
* [UIQM-555](https://issues.folio.org/browse/UIQM-555) Not change the pane header of the authority record while editing the 1xx field.
* [UIQM-596](https://issues.folio.org/browse/UIQM-596) Fix http error handling when Editing/Creating/Deriving MARC records.
* [UIQM-576](https://issues.folio.org/browse/UIQM-576) Generate 001 per selected authority file configuration.
* [UIQM-598](https://issues.folio.org/browse/UIQM-598) *BREAKING* Added onSave prop to handle saving records separately.
* [UIQM-577](https://issues.folio.org/browse/UIQM-577) Validate the 010 record when creating an authority record.
* [UIQM-606](https://issues.folio.org/browse/UIQM-606) Fetch only selectable source files for source file lookup modal.
* [UIQM-620](https://issues.folio.org/browse/UIQM-620) Validate the creation of authority records with base authority record validation rules.
* [UIQM-607](https://issues.folio.org/browse/UIQM-607) Wait for a redirect in the onSubmit function after creating a record.
* [UIQM-619](https://issues.folio.org/browse/UIQM-619) During linking, place $a subfield first for the 240 bib field if there is t->a subfield modification.
* [UIQM-625](https://issues.folio.org/browse/UIQM-625) Use `null` instead of empty string as an empty tenantId value.
* [UIQM-627](https://issues.folio.org/browse/UIQM-627) Add `shared` text to the title when editing a shared authority record.
* [UIQM-471](https://issues.folio.org/browse/UIQM-471) Added Dropdowns for fixed field 008 bib records.
* [UIQM-610](https://issues.folio.org/browse/UIQM-610) Split LDR by position & add dropdowns for create/edit/derive.
* [UIQM-611](https://issues.folio.org/browse/UIQM-611) Add tooltips for LDR positions.
* [UIQM-611](https://issues.folio.org/browse/UIQM-639) Use the `$` sign instead of `{dollar}` for search input and search query during manual linking.

## [7.0.5](https://github.com/folio-org/ui-quick-marc/tree/v7.0.5) (2023-12-11)

* [UIQM-588](https://issues.folio.org/browse/UIQM-588) Use Authority search to get Authority linked records count.

## [7.0.4](https://github.com/folio-org/ui-quick-marc/tree/v7.0.4) (2023-11-09)

* [UIQM-582](https://issues.folio.org/browse/UIQM-582) Show correct message if record not found.

## [7.0.3](https://github.com/folio-org/ui-quick-marc/tree/v7.0.3) (2023-11-03)

* [UIQM-571](https://issues.folio.org/browse/UIQM-571) Added `marc-records-editor.item.put` to Derive and Create Bib permissions to fix issue with broken links after deriving or creating a record.

## [7.0.2](https://github.com/folio-org/ui-quick-marc/tree/v7.0.2) (2023-10-27)

* [UIQM-571](https://issues.folio.org/browse/UIQM-571) Added `marc-records-editor.item.put` to Derive and Create Bib permissions to fix issue with broken links after deriving or creating a record.

## [7.0.1](https://github.com/folio-org/ui-quick-marc/tree/v7.0.1) (2023-10-13)

* Use correct version of `ui-plugin-find-authority`.

## [7.0.0](https://github.com/folio-org/ui-quick-marc/tree/v7.0.0) (2023-10-13)

* [UIQM-250](https://issues.folio.org/browse/UIQM-250) Updated invalid Leader position values error messages to be more informative.
* [UIQM-410](https://issues.folio.org/browse/UIQM-410) Add support for values 'b' and 'c' in Bib Leader/19
* [UIQM-355](https://issues.folio.org/browse/UIQM-355) Added a new permission "quickMARC: Create a new MARC bibliographic record"
* [UIQM-420](https://issues.folio.org/browse/UIQM-420) Remove initial values for Find Authority plugin References filter.
* [UIQM-428](https://issues.folio.org/browse/UIQM-428) Show an error message in modal after linking.
* [UIQM-424](https://issues.folio.org/browse/UIQM-424) Disable pressing `Enter` for linked fields.
* [UIQM-361](https://issues.folio.org/browse/UIQM-361) Create Orig Bib Record: Open new record in quickMARC UI.
* [UIQM-432](https://issues.folio.org/browse/UIQM-432) Avoid private paths in stripes-core imports.
* [UIQM-421](https://issues.folio.org/browse/UIQM-421) Add correct validation to save derived records.
* [UIQM-445](https://issues.folio.org/browse/UIQM-445) Fix missing permission to view MARC Authority icon in MARC bib source view
* [UIQM-447](https://issues.folio.org/browse/UIQM-447) Upgrade instance-authority-links interface to 2.0
* [UIQM-382](https://issues.folio.org/browse/UIQM-382) quickMARC Bib Validation: Make 010 a non-repeatable field in create, edit, and derive bib records
* [UIQM-429](https://issues.folio.org/browse/UIQM-429) Prevent many location in Marc holdings record.
* [UIQM-449](https://issues.folio.org/browse/UIQM-449) Link Authority: Pre-populate search/browse box with bib subfield values
* [UIQM-415](https://issues.folio.org/browse/UIQM-415) Create original bib record in quickMARC UI
* [UIQM-412](https://issues.folio.org/browse/UIQM-412) Fix translation format: MARC field number isn't highlighted in bold
* [UIQM-423](https://issues.folio.org/browse/UIQM-423) Fix display person who last edited quickMARC record
* [UIQM-457](https://issues.folio.org/browse/UIQM-457) Always replace bib $0 with Authority's baseURL + naturalId.
* [UIQM-450](https://issues.folio.org/browse/UIQM-450) Take the authority control subfields from the linking rules.
* [UIQM-448](https://issues.folio.org/browse/UIQM-448) Fix validation of 001 fields when creating/deriving/editing all record types.
* [UIQM-463](https://issues.folio.org/browse/UIQM-463) Upgrade to new interfaces.
* [UIQM-470](https://issues.folio.org/browse/UIQM-470) Add permission for editing MARC Holdings records.
* [UIQM-419](https://issues.folio.org/browse/UIQM-419) Make Leader validation error message consistent for all MARC types.
* [UIQM-465](https://issues.folio.org/browse/UIQM-465) Bib Rec. / Field 008 / Ctrl / Removed unused Ctrl field.
* [UIQM-464](https://issues.folio.org/browse/UIQM-464) Create Orig Bib Record: Populate new record with 008.
* [UIQM-492](https://issues.folio.org/browse/UIQM-492) Fix error when changing field type from 00X to content and vice versa.
* [UIQM-496](https://issues.folio.org/browse/UIQM-496) Conduct an Advanced search when $0 is present.
* [UIQM-485](https://issues.folio.org/browse/UIQM-485) Replace "align-items: start;" with "align-items: flex-start;" for better support.
* [UIQM-488](https://issues.folio.org/browse/UIQM-488) Change records-editor.records interface name and permission names to marc-records-editor
* [UIQM-459](https://issues.folio.org/browse/UIQM-459) Make 008 field required for MARC bibliographic/authority/holdings records.
* [UIQM-500](https://issues.folio.org/browse/UIQM-500) Remove 008 Entered field when Deriving a record.
* [UIQM-499](https://issues.folio.org/browse/UIQM-499) Auto-populate empty positions for fields 006, 007 and 008.
* [UIQM-380](https://issues.folio.org/browse/UIQM-380) Create Orig Authority Record: Open new record in quickMARC UI.
* [UIQM-326](https://issues.folio.org/browse/UIQM-326) Add auto-linking MARC bib fields.
* [UIQM-443](https://issues.folio.org/browse/UIQM-443) Auto-linking MARC bib. Handling multiple authority records matches.
* [UIQM-436](https://issues.folio.org/browse/UIQM-436) Auto-linking MARC bib. Handling multiple subfield 0.
* [UIQM-509](https://issues.folio.org/browse/UIQM-509) Autopopulate subfields when Creating MARC records.
* [UIQM-501](https://issues.folio.org/browse/UIQM-501) Actualize linked fields on save.
* [UIQM-532](https://issues.folio.org/browse/UIQM-532) *BREAKING* Bump `react` to `v18`.
* [UIQM-480](https://issues.folio.org/browse/UIQM-480) Derive new local MARC bib record from Shared Instance record.
* [UIQM-483](https://issues.folio.org/browse/UIQM-483) Add "Local" or "Shared" to flag MARC bib records.
* [UIQM-484](https://issues.folio.org/browse/UIQM-484) Edit MARC bib record on Shared Instance.
* [UIQM-542](https://issues.folio.org/browse/UIQM-542) Bump plugin-find-authority and stripes-acq-components.
* [UIQM-535](https://issues.folio.org/browse/UIQM-535) Update Node.js to v18 in GitHub Actions.
* [UIQM-544](https://issues.folio.org/browse/UIQM-544) Add "Local" or "Shared" to flag MARC authorities.
* [UIQM-545](https://issues.folio.org/browse/UIQM-545) Change tenant id to central when opening details of Shared Authority.
* [UIQM-547](https://issues.folio.org/browse/UIQM-547) Link Shared/Local MARC bib record to Shared/Local Authority record.
* [UIQM-550](https://issues.folio.org/browse/UIQM-550) Use onClose prop when a derived record is saved to have one source of truth to remove unnecessary params.
* [UIQM-552](https://issues.folio.org/browse/UIQM-552) Hide the Shared facet in the plugin for the shared bib record.
* [UIQM-554](https://issues.folio.org/browse/UIQM-554) Don't pass any arguments to the onClose callback when clicking the Cancel panel button.
* [UIQM-556](https://issues.folio.org/browse/UIQM-556) Edit Shared MARC authority record, update Shared & Local Instances.
* [UIQM-558](https://issues.folio.org/browse/UIQM-558) *BREAKING* bump `react-intl` to `v6.4.4`.
* [UIQM-559](https://issues.folio.org/browse/UIQM-559) Make auto-linking for the consortium.
* [UIQM-558](https://issues.folio.org/browse/UIQM-558) Allow a user to select a location code from the plugin.
* [UIQM-562](https://issues.folio.org/browse/UIQM-562) Fix optimistic locking error doesn't appear when edit "MARC authority" record.
* [UIQM-564](https://issues.folio.org/browse/UIQM-564) Hide permission `quickMARC: Create a new MARC authority record
* [UIQM-431](https://issues.folio.org/browse/UIQM-431) Marc record fixed field 008 with proper order.
* [UIQM-568](https://issues.folio.org/browse/UIQM-568) Remove second call to links-suggestion endpoint. Now only need to send one call to member tenant.
* [UIQM-590](https://issues.folio.org/browse/UIQM-590) Renaming labels and hints / Data 1-2 instead Start-End Date

## [6.0.2](https://github.com/folio-org/ui-quick-marc/tree/v6.0.2) (2023-03-30)

* [UIQM-413](https://issues.folio.org/browse/UIQM-413) Updated the @folio/plugin-find-authority dependency to ^2.0.0
* [UIQM-430](https://issues.folio.org/browse/UIQM-430) If the user manually enters the $9 field on a non-linkable, then hide the authorized icon on the view source.
* [UIQM-426](https://issues.folio.org/browse/UIQM-426) Show error if $9 is added during deriving.
* [UIQM-422](https://issues.folio.org/browse/UIQM-422) Edit/Derive MARC bib | Show Type label on 006 and 007 MARC fields.
* [UIQM-426](https://issues.folio.org/browse/UIQM-426) Allow a user to manual enter/edit $9 for non-linkable/non-controllable bib field

## [6.0.1](https://github.com/folio-org/ui-quick-marc/tree/v6.0.1) (2023-03-14)

* [UIQM-395](https://issues.folio.org/browse/UIQM-395) Adding multiple "$a" in "010" field of linked "MARC Authority" leads to error.
* [UIQM-399](https://issues.folio.org/browse/UIQM-399) Linked MARC bib field - editable textbox does not support shortcut keys

## [6.0.0](https://github.com/folio-org/ui-quick-marc/tree/v6.0.0) (2023-02-23)

* [UIQM-275](https://issues.folio.org/browse/UIQM-275) Derive a new MARC bib/Edit a MARC bib | Link/Unlink a MARC bib field to/from an Authority record
* [UIQM-309](https://issues.folio.org/browse/UIQM-309) Make PUT /records request to save authority links after deriving a MARC Bib record
* [UIQM-281](https://issues.folio.org/browse/UIQM-281) FE | Linked bib fields | Derive a new MARC bibliographic record handling
* [UIQM-307](https://issues.folio.org/browse/UIQM-307) Link then Unlink bib field before saving record behavior
* [UIQM-312](https://issues.folio.org/browse/UIQM-312) Create a test Harness for quick marc tests
* [UIQM-314](https://issues.folio.org/browse/UIQM-314) Enable authority linking for the following MARC bib fields
* [UIQM-317](https://issues.folio.org/browse/UIQM-317) Linking of empty field with "MARC Authority" record doesn't happen
* [UIQM-313](https://issues.folio.org/browse/UIQM-313) Reference "MARC Authority" record is opened when user clicks on the "View MARC authority record" icon
* [UIQM-315](https://issues.folio.org/browse/UIQM-315) Rename "Duplicate BIB" feature to "Derive BIB" feature
* [UIQM-320](https://issues.folio.org/browse/UIQM-320) The permission "quickMARC: Can Link/unlink authority records to bib records" is hidden on UI.
* [UIQM-319](https://issues.folio.org/browse/UIQM-319) Not actual "relatedRecordVersion" value sends when user saves "MARC Bib" record
* [UIQM-295](https://issues.folio.org/browse/UIQM-295) FE - Linking Bib field 240 to Authority field 100/110/111
* [UIQM-333](https://issues.folio.org/browse/UIQM-333) Display an error message when user attempts to select an invalid authority heading
* [UIQM-297](https://issues.folio.org/browse/UIQM-297) FE | View Source | If a bib field is authorized then display authorized indicator
* [UIQM-332](https://issues.folio.org/browse/UIQM-332) Default search/browse option and Authority source file selections based on MARC bib field to be linked
* [UIQM-322](https://issues.folio.org/browse/UIQM-322) Edit MARC authority app | User edits the 1XX value and has linked bib fields
* [UIQM-331](https://issues.folio.org/browse/UIQM-331) Edit MARC authority: Handling updates 1XX or 010 $a value
* [UIQM-339](https://issues.folio.org/browse/UIQM-339) Uncontrolled subfield moved to read only box when linked "MARC Authority" has the same subfield indicator
* [UIQM-335](https://issues.folio.org/browse/UIQM-335) MARC Bibliographic | Print Source record
* [UIQM-330](https://issues.folio.org/browse/UIQM-330) FE - Edit MARC Authority record | MARC field 010 is not repeatable
* [UIQM-353](https://issues.folio.org/browse/UIQM-353) Fix "Reference" record opens when user clicks on the "View" icon next to the linked "MARC Bib" field
* [UIQM-345](https://issues.folio.org/browse/UIQM-345) Edit a MARC authority record | Do not allow user to delete 1XX field
* [UIQM-343](https://issues.folio.org/browse/UIQM-343) Edit/Derive a MARC bib record | Do not allow a user to delete MARC field 245
* [UIQM-344](https://issues.folio.org/browse/UIQM-344) Create/Edit MARC holdings | Do not allow user to delete MARC field 852
* [UIQM-341](https://issues.folio.org/browse/UIQM-341) Error handling | Edit/Derive a new MARC bib record | User adds an invalid $9
* [UIQM-370](https://issues.folio.org/browse/UIQM-370) Error when clearing "1XX" field tag for "MARC authority" record
* [UIQM-368](https://issues.folio.org/browse/UIQM-368) Bump stripes to 8.0.0 for Orchid/2023-R1
* [UIQM-359](https://issues.folio.org/browse/UIQM-359) Change to Linked MARC authority record has been updated confirmation messaging
* [UIQM-347](https://issues.folio.org/browse/UIQM-347) quickMARC | Show errors messages then show confirmation messages
* [UIQM-337](https://issues.folio.org/browse/UIQM-337) Controlled subfield is displayed as not controlled after linking of MARC Bib field with MARC Authority
* [UIQM-373](https://issues.folio.org/browse/UIQM-373) Save buttons are not disabled after removing unsaved updates from linked field in "MARC bib" record
* [UIQM-376](https://issues.folio.org/browse/UIQM-376) Reference MARC Authority record is opened when user clicks on the "MARC Authority" icon next to the controlled field
* [UIQM-349](https://issues.folio.org/browse/UIQM-349) Align the module with mod-search API breaking change
* [UIQM-348](https://issues.folio.org/browse/UIQM-348) Change to Linked MARC authority record has been updated confirmation messaging
* [UIQM-390](https://issues.folio.org/browse/UIQM-390) Fix exception when changing tag value to "010" in "MARC authority" record without "010" field
* [UIQM-367](https://issues.folio.org/browse/UIQM-367) Show an error toast message when user enters a subfield that is/can be controlled by an authority record or is the linking match point
* [UIQM-394](https://issues.folio.org/browse/UIQM-394) No delete icon for "010" field with valid value in "MARC authority" record not controlling any "MARC bib" record
* [UIQM-375](https://issues.folio.org/browse/UIQM-375) Do not add "http://" to "base url" when user links "MARC Bib's" field with "MARC Authority"
* [UIQM-386](https://issues.folio.org/browse/UIQM-386) Edit MARC authority | Add/Edit 010 $a when linking is based on 001.
* [UIQM-385](https://issues.folio.org/browse/UIQM-385) Edit/Derive quickMARC | Allow user to drag text boxes to view all content
* [UIQM-402](https://issues.folio.org/browse/UIQM-402) Add linkingRuleId to the request body for linked fields
* [UIQM-351](https://issues.folio.org/browse/UIQM-351) MARC Authority | Print Source record
* [UIQM-567](https://issues.folio.org/browse/UIQM-567) Add marc-specifications to interfaces.

## [5.2.0](https://github.com/folio-org/ui-quick-marc/tree/v5.2.0) (2022-10-26)

* [UIQM-259](https://issues.folio.org/browse/UIQM-259) Edit MARC authority: User does not get a notification that the record is edited has been deleted by another user.
* [UIQM-258](https://issues.folio.org/browse/UIQM-258) Add fake link Authority button next to MARC fields.
* [UIQM-261](https://issues.folio.org/browse/UIQM-261) Shift focus to MARC tag box once you click Add or Delete field.
* [UIQM-278](https://issues.folio.org/browse/UIQM-278) Add the ability to change the height of the QuickMarcView component.
* [UIQM-272](https://issues.folio.org/browse/UIQM-272) Edit quickMARC : Display a Save & keep editing button
* [UIQM-273](https://issues.folio.org/browse/UIQM-273) Add a new field : Default focus/cursor to after $a.
* [UIQM-254](https://issues.folio.org/browse/UIQM-254) New permission: quickMARC Link/unlink authority records to bib records.
* [UIQM-270](https://issues.folio.org/browse/UIQM-270) When user deletes a row then show a placeholder message that includes an Undo action.
* [UIQM-255](https://issues.folio.org/browse/UIQM-255) quickMARC : Allow a user to tab from one subfield to another using a shortcut key in a single row
* [UIQM-285](https://issues.folio.org/browse/UIQM-285) Also support version `12.0` of the `inventory` interface in okapiInterfaces.
* [UIQM-286](https://issues.folio.org/browse/UIQM-286) Add key to Marc fields.
* [UIQM-289](https://issues.folio.org/browse/UIQM-289) The entered data is deleted when user click on the "Save & close" button and validation error appears
* [UIQM-290](https://issues.folio.org/browse/UIQM-290) Detail Record : Click Link button to select a MARC authority record
* [UIQM-274](https://issues.folio.org/browse/UIQM-274) Derive/Edit a bib record | Display link icon for eligible name bib fields to link to authority records and show Select a MARC authority plug-in
* [UIQM-276](https://issues.folio.org/browse/UIQM-276) Derive/Edit MARC bib | Link bib field to authority record | Validate and Generate $0 value
* [UIQM-293](https://issues.folio.org/browse/UIQM-293) Edit/Derive - MARC bib - Remove 008 Desc box
* [UIQM-292](https://issues.folio.org/browse/UIQM-292) Change field level actions for "Move field a row" buttons.
* [UIQM-284](https://issues.folio.org/browse/UIQM-284) Linked bib field | Show View Authority icon
* [UIQM-305](https://issues.folio.org/browse/UIQM-305) Resolve ui-quick-marc and stripes-authority-component circular dependency
* [UIQM-301](https://issues.folio.org/browse/UIQM-301) quickMARC: Add a11y tests
* [UIQM-311](https://issues.folio.org/browse/UIQM-311) Edit/Derive MARC bib | Improve error messaging for Leader positions 18 and 19
* [UIQM-310](https://issues.folio.org/browse/UIQM-310) Update spacing between Save & continue and Save & close buttons
* [UIQM-288](https://issues.folio.org/browse/UIQM-288) Authority control: Hide link authority button before Nolana release

## [5.1.3](https://github.com/folio-org/ui-quick-marc/tree/v5.1.3) (2022-11-18)

* [UIQM-321](https://issues.folio.org/browse/UIQM-321) Deleted fields not processing when deriving a new MARC bibliographic record

## [5.1.2](https://github.com/folio-org/ui-quick-marc/tree/v5.1.2) (2022-08-23)

* [UIQM-266](https://issues.folio.org/browse/UIQM-266) Edit quickMARC: Undoing a delete field is not restored in the same position.
* [UIQM-269](https://issues.folio.org/browse/UIQM-269) Remove default $a subfield at "852" field when user created "MARC Holdings" record

## [5.1.1](https://github.com/folio-org/ui-quick-marc/tree/v5.1.1) (2022-08-05)

* [UIQM-263](https://issues.folio.org/browse/UIQM-263) Cannot access a MARC bib because creator has been deleted. Handling a 404 error.
* [UIQM-260](https://issues.folio.org/browse/UIQM-260) Fix Add MARC holdings:  852 field > cannot enter text
* [UIQM-267](https://issues.folio.org/browse/UIQM-267) MARC Holdings - Leader position 18 accept a space and \ as a valid value
* [UIQM-262](https://issues.folio.org/browse/UIQM-262) FE: Derive/Edit MARC bibliographic record: Improve Leader position 08 error message
* [UIQM-265](https://issues.folio.org/browse/UIQM-265) Add/Edit MARC Holdings - Adding a new field above MARC 852 results in 852$b value populating the newly added field
* [UIQM-256](https://issues.folio.org/browse/UIQM-256) Change field level actions display

## [5.1.0](https://github.com/folio-org/ui-quick-marc/tree/v5.1.0) (2022-07-08)

* [UIQM-213](https://issues.folio.org/browse/UIQM-213) New Permission: View MARC holdings record.
* [UIQM-212](https://issues.folio.org/browse/UIQM-212) New permission: View source (instance).
* [UIQM-162](https://issues.folio.org/browse/UIQM-162) Optimistic locking: display error message to inform user about OL.
* [UIQM-217](https://issues.folio.org/browse/UIQM-217) Update dependencies: `stripes-acq-components` to v3.1.1.
* [UIQM-224](https://issues.folio.org/browse/UIQM-224) Replace or remove react-hot-loader.
* [UIQM-230](https://issues.folio.org/browse/UIQM-230) Replace `babel-eslint` with `@babel/eslint-parser`.
* [UIQM-53](https://issues.folio.org/browse/UIQM-53) Adjust the quickMARC edit UI to indicate that specific fields are protected.
* [UIQM-233](https://issues.folio.org/browse/UIQM-233) MARC authority: Leader field make the following positions editable.
* [UIQM-234](https://issues.folio.org/browse/UIQM-234) FE: Derive/Edit MARC bibliographic record: Make positions 06 and 07 editable.
* [UIQM-231](https://issues.folio.org/browse/UIQM-231) Fix user able to replace the '001' field value when edit record in quickmarc.
* [UIQM-238](https://issues.folio.org/browse/UIQM-238) Fix Save & Close button not working.
* [UIQM-242](https://issues.folio.org/browse/UIQM-242) Apply to MARC Authority:  Optimistic locking: display error message to inform user about OL
* [UIQM-239](https://issues.folio.org/browse/UIQM-239) FE: Derive/Edit MARC bibliographic record: Error message for when a user attempts to edit a read-only leader value  is not updated
* [UIQM-247](https://issues.folio.org/browse/UIQM-247) Folio crashes in quickmarc editor when cypress clears LDR field
* [UIQM-243](https://issues.folio.org/browse/UIQM-243) Optimistic Locking: Do not send update request when user attempts to update older version of MARC bib/holdings/authority
* [UIQM-244](https://issues.folio.org/browse/UIQM-244) Fix undefined user name
* [UIQM-246] (https://issues.folio.org/browse/UIQM-246) MARC Holdings | Update error toast notification message when user edit 18 position of LDR
* [UIQM-251] (https://issues.folio.org/browse/UIQM-251) Edit/Derive Bib and Create/Edit Holdings - URL in error toast notifications does not work
* [UIQM-240](https://issues.folio.org/browse/UIQM-240) Edit/Derive MARC bib > Changes to Leader position 17 validation AND 008 byte.

## [5.0.3](https://github.com/folio-org/ui-quick-marc/tree/v5.0.3) (2022-06-15)

* [UIQM-228](https://issues.folio.org/browse/UIQM-228) "Save & close" button accessibility when edit bib/holdings/authority record via "quickMARC".
* [UIQM-241](https://issues.folio.org/browse/UIQM-241) update NodeJS to v16 in GitHub Actions

## [5.0.2](https://github.com/folio-org/ui-quick-marc/tree/v5.0.2) (2022-04-08)

* [UIQM-226](https://issues.folio.org/browse/UIQM-226) MARC holdings: Can add multiple 852s tags.

## [5.0.1](https://github.com/folio-org/ui-quick-marc/tree/v5.0.1) (2022-03-29)

* [UIQM-219](https://issues.folio.org/browse/UIQM-219) Cannot assign MARC authority permissions only.

## [5.0.0](https://github.com/folio-org/ui-quick-marc/tree/v5.0.0) (2022-03-03)
[Full Changelog](https://github.com/folio-org/ui-quick-marc/compare/v4.0.3...v5.0.0)

* [UIQM-148](https://issues.folio.org/browse/UIQM-148) Change error message when MARC tag does not contain 3 digits.
* [UIQM-155](https://issues.folio.org/browse/UIQM-155) Update according changed logic for deriving.
* [UIQM-153](https://issues.folio.org/browse/UIQM-153) Optimistic locking: update payload when update a marc record.
* [UIQM-157](https://issues.folio.org/browse/UIQM-157) Fix validation for new row of quickMarc record.
* [UIQM-159](https://issues.folio.org/browse/UIQM-159) Remove unnecessary cancellation modal on derive record page.
* [UIQM-163](https://issues.folio.org/browse/UIQM-163) Edit bib record: Update error messaging when entered an invalid value for Leader/05.
* [UIQM-132](https://issues.folio.org/browse/UIQM-132) Create a MARC Holdings Record.
* [UIQM-177](https://issues.folio.org/browse/UIQM-177) Omit `Record` on Status and Last updated labels when Edit/Derive quickMARC.
* [UIQM-167](https://issues.folio.org/browse/UIQM-167) Do not allow user to add multiple 004s for MARC Holdings.
* [UIQM-164](https://issues.folio.org/browse/UIQM-164) Autopopulate an empty indicator box with a backslash when a value is missing in a box.
* [UIQM-166](https://issues.folio.org/browse/UIQM-166) Do not allow user to add multiple 852s for MARC Holdings.
* [UIQM-182](https://issues.folio.org/browse/UIQM-182) Update onSubmit action for `<QuickMarcCreateWrapper>`
* [UIQM-181](https://issues.folio.org/browse/UIQM-181) Add as a default `008` and `852` fields to create MARC Holdings record page.
* [UIQM-183](https://issues.folio.org/browse/UIQM-183) Add QuickMarcView component.
* [UIQM-191](https://issues.folio.org/browse/UIQM-191) Use supported `uuid`.
* [UIQM-142](https://issues.folio.org/browse/UIQM-142) Edit MARC authority record via quickMARC.
* Lock `faker` version.
* [UIQM-195](https://issues.folio.org/browse/UIQM-195) Changes for MARC Authorities App: Closing third pane does not resize the second pane.
* [UIQM-198](https://issues.folio.org/browse/UIQM-198) Saving a MARC holdings record upon creation/update displays Instance record then Holdings record.
* [UIQM-199](https://issues.folio.org/browse/UIQM-199) MARC Authority: Implement App context menu and keyboard shortcuts.
* [UIQM-196](https://issues.folio.org/browse/UIQM-196) Update error message when user adds multiple 1XXs.
* [UIQM-190](https://issues.folio.org/browse/UIQM-190) Edit MARC holdings (quickMARC) update paneheader display.
* [UIQM-189](https://issues.folio.org/browse/UIQM-189) Add/Edit MARC holdings record: Improve error messaging when user enters an invalid Location (852 $b) value
* [UIQM-187](https://issues.folio.org/browse/UIQM-187) Add a new MARC holdings/Edit MARC Holdings - 852 field display a Location Lookup link and modal.
* [UIQM-197](https://issues.folio.org/browse/UIQM-197) Edit MARC authority record | Remove last 1XX crashes MARC Authority app.
* [UIQM-203](https://issues.folio.org/browse/UIQM-203) MARC Holdings: Update 008 default position values.
* [UIQM-204](https://issues.folio.org/browse/UIQM-204) Edit MARC holdings via quickMARC > Cannot save 008's Gen ret position.
* [UIQM-205](https://issues.folio.org/browse/UIQM-205) Improve handling of parsing multiple subfields.
* [UIQM-202](https://issues.folio.org/browse/UIQM-202) Fix tests that fail due to timeouts on Jenkins.
* [UIQM-209](https://issues.folio.org/browse/UIQM-209) Highlight clicked on Heading/Reference in Authorities Detail record
* [UIQM-207](https://issues.folio.org/browse/UIQM-207) ui-quick-marc: Configure GitHub actions
* [UIQM-214](https://issues.folio.org/browse/UIQM-214) Update 'records-editor.records' interface version to v3.1.

## [4.0.3](https://github.com/folio-org/ui-quick-marc/tree/v4.0.3) (2021-11-09)

* [UIQM-165](https://issues.folio.org/browse/UIQM-165) Update error message when user attempts to save a record without a 852.

## [4.0.2](https://github.com/folio-org/ui-quick-marc/tree/v4.0.2) (2021-11-02)
* [UIQM-161](https://issues.folio.org/browse/UIQM-161) Remove add button for MARC holdings tag 004.
* [UIQM-169](https://issues.folio.org/browse/UIQM-169) Changing 007 type dropdown value does not enable the Save button.
* [UIQM-172](https://issues.folio.org/browse/UIQM-172) Changing 006 type dropdown value does not enable the Save button.
* [UIQM-152](https://issues.folio.org/browse/UIQM-152) Fix 008 `Rept date` field.

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
