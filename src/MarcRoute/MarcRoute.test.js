import { render } from '@folio/jest-config-stripes/testing-library/react';

import Harness from '../../test/jest/helpers/harness';

import MarcRoute from './MarcRoute';
import { useUserTenantPermissions } from '../queries';
import { MARC_TYPES } from '../common/constants';
import { QUICK_MARC_ACTIONS } from '../QuickMarcEditor/constants';
import { applyCentralTenantInHeaders } from '../QuickMarcEditor/utils';

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useUserTenantPermissions: jest.fn(),
}));

jest.mock('../QuickMarcEditor/utils', () => ({
  ...jest.requireActual('../QuickMarcEditor/utils'),
  applyCentralTenantInHeaders: jest.fn(),
}));

const routeProps = {
  action: QUICK_MARC_ACTIONS.EDIT,
  marcType: MARC_TYPES.BIB,
};

const renderMarcRoute = ({ history, ...props } = {}) => (render(
  <Harness history={history}>
    <MarcRoute
      externalRecordPath="/inventory/view"
      path="/inventory/quick-marc/edit-bib/:externalId"
      permission="ui-quick-marc.quick-marc-editor.all"
      routeProps={routeProps}
      onClose={() => {}}
      onSave={() => {}}
      {...props}
    />
  </Harness>,
));

describe('Given Quick Marc', () => {
  beforeEach(() => {
    useUserTenantPermissions.mockReturnValue({
      userPermissions: [],
      isFetching: false,
    });

    applyCentralTenantInHeaders.mockReturnValue(false);
  });

  describe('when a member tenant edits shared record', () => {
    it('should fetch the central tenant permissions', () => {
      const userPermissions = [{
        permissionName: 'ui-quick-marc.quick-marc-editor.all',
      }];

      useUserTenantPermissions.mockReturnValue({
        userPermissions,
        isFetching: false,
      });

      applyCentralTenantInHeaders.mockReturnValue(true);

      renderMarcRoute();

      expect(useUserTenantPermissions).toHaveBeenCalledWith({
        tenantId: 'consortia',
        userId: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
      }, {
        enabled: true,
      });
    });
  });
});
