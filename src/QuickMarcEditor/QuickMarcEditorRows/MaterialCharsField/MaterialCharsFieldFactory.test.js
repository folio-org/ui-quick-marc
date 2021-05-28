import React from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { render } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { MaterialCharsFieldFactory } from './MaterialCharsFieldFactory';

const renderMaterialCharsFieldFactory = (component) => render(
  <Form
    onSubmit={() => {}}
    mutators={arrayMutators}
    render={() => component}
  />,
);

describe('MaterialCharsFieldFactory', () => {
  let component;

  it('should render ContinuingMaterialCharsField', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 's');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('continuing-material-chars-field')).toBeDefined();
  });

  it('should render BookMaterialCharsField', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'a');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('book-material-chars-field')).toBeDefined();
  });

  it('should render ComputerFileMaterialCharsFieldd', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'm');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('computer-file-material-chars-field')).toBeDefined();
  });

  it('should render MapMaterialCharsField', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'e');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('map-material-chars-field')).toBeDefined();
  });

  it('should render MixedMaterialCharsField', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'p');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('mixed-material-chars-field')).toBeDefined();
  });

  it('should render MediaMaterialCharsField', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'c');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('media-material-chars-field')).toBeDefined();
  });

  it('should render VisualMaterialCharsField', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'g');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('visual-material-chars-field')).toBeDefined();
  });

  it('should render UnknownMaterialCharsField', () => {
    component = MaterialCharsFieldFactory.getMaterialCharsFieldField('records', '');

    const { getByTestId } = renderMaterialCharsFieldFactory(component);

    expect(getByTestId('unknown-material-chars-field')).toBeDefined();
  });
});
