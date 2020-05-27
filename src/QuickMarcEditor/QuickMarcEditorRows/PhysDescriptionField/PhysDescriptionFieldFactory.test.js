import '@folio/stripes-acq-components/test/jest/__mock__';

import { PhysDescriptionFieldFactory } from './PhysDescriptionFieldFactory';

import MapPhysDescriptionField from './MapPhysDescriptionField';
import ElResourcePhysDescriptionField from './ElResourcePhysDescriptionField';
import GlobePhysDescriptionField from './GlobePhysDescriptionField';
import TactilePhysDescriptionField from './TactilePhysDescriptionField';
import ProjGraphicPhysDescriptionField from './ProjGraphicPhysDescriptionField';
import MicroformDescriptionField from './MicroformDescriptionField';
import NonProjGraphicPhysDescriptionField from './NonProjGraphicPhysDescriptionField';
import PicturePhysDescriptionField from './PicturePhysDescriptionField';
import KitPhysDescriptionField from './KitPhysDescriptionField';
import MusicPhysDescriptionField from './MusicPhysDescriptionField';
import RSImagePhysDescriptionField from './RSImagePhysDescriptionField';
import SoundPhysDescriptionField from './SoundPhysDescriptionField';
import TextPhysDescriptionField from './TextPhysDescriptionField';
import VideoPhysDescriptionField from './VideoPhysDescriptionField';
import UnspecifiedPhysDescriptionField from './UnspecifiedPhysDescriptionField';
import UnknownPhysDescriptionField from './UnknownPhysDescriptionField';

describe('PhysDescriptionFieldFactory', () => {
  it('should create correct fields', () => {
    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'a').type.displayName,
    ).toBe(MapPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'c').type.displayName,
    ).toBe(ElResourcePhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'd').type.displayName,
    ).toBe(GlobePhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'f').type.displayName,
    ).toBe(TactilePhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'g').type.displayName,
    ).toBe(ProjGraphicPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'h').type.displayName,
    ).toBe(MicroformDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'k').type.displayName,
    ).toBe(NonProjGraphicPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'm').type.displayName,
    ).toBe(PicturePhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'o').type.displayName,
    ).toBe(KitPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'q').type.displayName,
    ).toBe(MusicPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'r').type.displayName,
    ).toBe(RSImagePhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 's').type.displayName,
    ).toBe(SoundPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 't').type.displayName,
    ).toBe(TextPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'v').type.displayName,
    ).toBe(VideoPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'z').type.displayName,
    ).toBe(UnspecifiedPhysDescriptionField.displayName);

    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'j').type.displayName,
    ).toBe(UnknownPhysDescriptionField.displayName);
    expect(
      PhysDescriptionFieldFactory.getPhysDescriptionField('records', 'w').type.displayName,
    ).toBe(UnknownPhysDescriptionField.displayName);
  });
});
