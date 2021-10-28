import getPhysDescriptionFieldConfig from './getPhysDescriptionFieldConfig';

jest.mock('./MapPhysDescriptionFieldConfig', () => 'MapPhysDescriptionFieldConfig');
jest.mock('./ElResourcePhysDescriptionFieldConfig', () => 'ElResourcePhysDescriptionFieldConfig');
jest.mock('./GlobePhysDescriptionFieldConfig', () => 'GlobePhysDescriptionFieldConfig');
jest.mock('./TactilePhysDescriptionFieldConfig', () => 'TactilePhysDescriptionFieldConfig');
jest.mock('./ProjGraphicPhysDescriptionFieldConfig', () => 'ProjGraphicPhysDescriptionFieldConfig');
jest.mock('./MicroformDescriptionFieldConfig', () => 'MicroformDescriptionFieldConfig');
jest.mock('./NonProjGraphicPhysDescriptionFieldConfig', () => 'NonProjGraphicPhysDescriptionFieldConfig');
jest.mock('./PicturePhysDescriptionFieldConfig', () => 'PicturePhysDescriptionFieldConfig');
jest.mock('./KitPhysDescriptionFieldConfig', () => 'KitPhysDescriptionFieldConfig');
jest.mock('./MusicPhysDescriptionFieldConfig', () => 'MusicPhysDescriptionFieldConfig');
jest.mock('./RSImagePhysDescriptionFieldConfig', () => 'RSImagePhysDescriptionFieldConfig');
jest.mock('./SoundPhysDescriptionFieldConfig', () => 'SoundPhysDescriptionFieldConfig');
jest.mock('./TextPhysDescriptionFieldConfig', () => 'TextPhysDescriptionFieldConfig');
jest.mock('./VideoPhysDescriptionFieldConfig', () => 'VideoPhysDescriptionFieldConfig');
jest.mock('./UnspecifiedPhysDescriptionFieldConfig', () => 'UnspecifiedPhysDescriptionFieldConfig');
jest.mock('./UnknownPhysDescriptionFieldConfig', () => 'UnknownPhysDescriptionFieldConfig');

describe('getPhysDescriptionFieldConfig', () => {
  it('should return correct config based on type', () => {
    expect(getPhysDescriptionFieldConfig('a')).toEqual('MapPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('c')).toEqual('ElResourcePhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('d')).toEqual('GlobePhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('f')).toEqual('TactilePhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('g')).toEqual('ProjGraphicPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('h')).toEqual('MicroformDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('k')).toEqual('NonProjGraphicPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('m')).toEqual('PicturePhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('o')).toEqual('KitPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('q')).toEqual('MusicPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('r')).toEqual('RSImagePhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('s')).toEqual('SoundPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('t')).toEqual('TextPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('v')).toEqual('VideoPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('z')).toEqual('UnspecifiedPhysDescriptionFieldConfig');
    expect(getPhysDescriptionFieldConfig('1')).toEqual('UnknownPhysDescriptionFieldConfig');
  });
});
