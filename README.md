# ui-quick-marc

Copyright (C) 2020 The Open Library Foundation

This software is distributed under the terms of the Apache License,
Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

## Introduction

This package furnishes a single Stripes plugin of type `quick-marc`,
which can be included in Stripes modules by means of a `<Pluggable
type="quick-marc">` element. See [the *Plugins*
section](https://github.com/folio-org/stripes-core/blob/master/doc/dev-guide.md#plugins)
of the Module Developer's Guide.

## Terminology

*External record* - a record that is created based on a MARC record. For example for MARC Bibliographic records an external record would be an Inventory Instance record. For MARC Holdings - an external record is an Inventory Holdings record etc.

## Props

| Name | Type | Description | Required |
--- | --- | --- | --- |
| `basePath` | string | Base route of MARC editor | Yes, when quickMARC pre-defined routes. Otherwise No. See `useRoutes` prop for additional details about pre-defined vs. route-less approaches. |
| `externalRecordPath` | string | Pathname to fetch an external record. Used for Optimistic Locking | No |
| `action` | string | One of quickMARC actions: "create", "edit" or "derive" | Yes for route-less, No for pre-defined routes |
| `marcType` | string | Type of MARC record. "bibliographic", "holdings" or "authority" | Yes for route-less, No for pre-defined routes |
| `instanceId` | string | UUID of an Inventory Instance record. This prop is only needed for MARC Holdings. MARC Holdings is defined by 2 UUIDs: Holdings and the Instance that the Holdings belongs to. This means that for MARC Holdings `externalId` is Holdings UUID, and `instanceId` is Instance UUID. | Yes for route-less and when `marcType` is "holdings", No for pre-defined routes. |
| `externalId` | string | UUID of an external record. See "Terminology" section above. | Yes for route-less, No for pre-defined routes |
| `isShared` | bool | Tells quickMARC if the edited MARC record shared or not. | Yes for route-less and when `action` is "edit", No for pre-defined routes |
| `onClose` | function | Called when closing quickMARC. Called with `externalId` when `marcType` is "bibliographic" or "authority". For `marcType` "holdings" it's called with `instanceId/externalId` | Yes |
| `onSave` | function | Called after saving and closing a record. Called with `externalId` when `marcType` is "bibliographic" or "authority". For `marcType` "holdings" it's called with `instanceId/externalId` | Yes |
| `onCreateAndKeepEditing` | function | Called after creating/deriving a record via "Save and keep editing" button. Called with `externalId` when `marcType` is "bibliographic" or "authority". For `marcType` "holdings" it's called with `instanceId/externalId` | Yes for route-less, No for pre-defined routes |
| `useRoutes` | bool | When `true` - quickMARC will define it's own routes that the consuming application will have to redirect to. When `false` - quickMARC will act like a regular plug-in and simply render a view, and the consuming application will have to define it's own routes and provide some props to quickMARC. | No |
| `initialValues` | object | Values to initialize quickMARC with. Shape should match the response from `records-editor/records` endpoint. Will only be applied when `useRoutes` is `false`. | No |
| `isPreEdited` | bool | Tells quickMARC that `initialValues` is a pre-edited MARC record. In this case quickMARC will fetch a MARC record from BE and first initialize with it, and then replace fields with fields from `initialValues`. This prop will only be applied when `useRoutes` is `false`. | No |
| `fetchExternalRecord` | func | Should resolve an Edited/Derived Instance/Holding/Authority record depending on marcType | Yes |
| `locations` | array | Array of location objects. | Yes for MARC Holdings |





This is a [Stripes](https://github.com/folio-org/stripes-core/) UI module to edit MARC records.

## Additional information

Other [modules](https://dev.folio.org/source-code/#client-side).

See project [UIQM](https://issues.folio.org/browse/UIQM)
at the [FOLIO issue tracker](https://dev.folio.org/guidelines/issue-tracker).

Other FOLIO Developer documentation is at [dev.folio.org](https://dev.folio.org/)
