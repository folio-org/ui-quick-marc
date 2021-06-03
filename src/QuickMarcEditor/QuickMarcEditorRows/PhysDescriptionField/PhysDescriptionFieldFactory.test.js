import React from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { render } from '@testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import { PhysDescriptionFieldFactory } from './PhysDescriptionFieldFactory';

const renderPhysDescriptionFieldFactory = (component) => render(
  <Form
    onSubmit={() => {}}
    mutators={arrayMutators}
    render={() => component}
  />,
);

describe('PhysDescriptionFieldFactory', () => {
  let component;

  it('should render MapPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'a');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('map-phys-description-field')).toBeDefined();
  });

  it('should render ElResourcePhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'c');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('el-resource-phys-description-field')).toBeDefined();
  });

  it('should render GlobePhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'd');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('globe-phys-description-field')).toBeDefined();
  });

  it('should render TactilePhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'f');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('tactile-phys-description-field')).toBeDefined();
  });

  it('should render ProjGraphicPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'g');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('proj-graphic-phys-description-field')).toBeDefined();
  });

  it('should render MicroformDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'h');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('microform-phys-description-field')).toBeDefined();
  });

  it('should render NonProjGraphicPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'k');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('non-proj-graphic-phys-description-field')).toBeDefined();
  });

  it('should render PicturePhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'm');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('picture-phys-description-field')).toBeDefined();
  });

  it('should render KitPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'o');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('kit-phys-description-field')).toBeDefined();
  });

  it('should render MusicPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'q');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('music-phys-description-field')).toBeDefined();
  });

  it('should render RSImagePhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'r');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('rsimage-phys-description-field')).toBeDefined();
  });

  it('should render SoundPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 's');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('sound-phys-description-field')).toBeDefined();
  });

  it('should render TextPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 't');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('text-phys-description-field')).toBeDefined();
  });

  it('should render VideoPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'v');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('video-phys-description-field')).toBeDefined();
  });

  it('should render UnspecifiedPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'z');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('unspecified-phys-description-field')).toBeDefined();
  });

  it('should render UnknownPhysDescriptionField', () => {
    component = PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'j');

    const { getByTestId } = renderPhysDescriptionFieldFactory(component);

    expect(getByTestId('unknown-phys-description-field')).toBeDefined();
  });
});
