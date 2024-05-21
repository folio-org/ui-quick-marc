import React from 'react';

import { render } from '@folio/jest-config-stripes/testing-library/react';
import { runAxeTest } from '@folio/stripes-testing';

import { SearchLink } from './SearchLink';

import Harness from '../../../../test/jest/helpers/harness';

const renderComponent = (props = {}) => render(
  <Harness history={props.history}>
    <SearchLink
      field={{
        content: '$a some value',
      }}
      {...props}
    />
  </Harness>,
);

describe('Given SearchLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with no axe errors', async () => {
    const { container } = renderComponent();

    await runAxeTest({
      rootNode: container,
    });
  });

  describe('when there is just one $a', () => {
    it('should render a correct link with one $a value', () => {
      const { getByRole } = renderComponent();

      expect(getByRole('link').href).toContain('/inventory?qindex=advancedSearch&query=lccn+exactPhrase+some+value');
    });
  });

  describe('when there is $a and $z', () => {
    it('should render a correct link with $a and $z values', () => {
      const { getByRole } = renderComponent({
        field: {
          content: '$a value a $z value z',
        },
      });

      expect(getByRole('link').href).toContain('/inventory?qindex=advancedSearch&query=lccn+exactPhrase+value+a+or+lccn+exactPhrase+value+z');
    });
  });

  describe('when there there are more than 6 $a or $z', () => {
    it('should render a correct link with maximum 5 values', () => {
      const { getByRole } = renderComponent({
        field: {
          content: '$a v1 $a v2 $a v3 $a v4 $z v5 $z v6 $z v7',
        },
      });

      expect(getByRole('link').href).toContain('/inventory?qindex=advancedSearch&query=lccn+exactPhrase+v1+or+lccn+exactPhrase+v2+or+lccn+exactPhrase+v3+or+lccn+exactPhrase+v4+or+lccn+exactPhrase+v5+or+lccn+exactPhrase+v6');
    });
  });
});
