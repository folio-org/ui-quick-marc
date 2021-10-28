import getMaterialCharsFieldConfig from './getMaterialCharsFieldConfig';

jest.mock('./BookMaterialCharsFieldConfig', () => 'BookMaterialCharsFieldConfig');
jest.mock('./ComputerFileMaterialCharsFieldConfig', () => 'ComputerFileMaterialCharsFieldConfig');
jest.mock('./ContinuingMaterialCharsFieldConfig', () => 'ContinuingMaterialCharsFieldConfig');
jest.mock('./MapMaterialCharsFieldConfig', () => 'MapMaterialCharsFieldConfig');
jest.mock('./MixedMaterialCharsFieldConfig', () => 'MixedMaterialCharsFieldConfig');
jest.mock('./MediaMaterialCharsFieldConfig', () => 'MediaMaterialCharsFieldConfig');
jest.mock('./VisualMaterialCharsFieldConfig', () => 'VisualMaterialCharsFieldConfig');
jest.mock('./UnknownMaterialCharsFieldConfig', () => 'UnknownMaterialCharsFieldConfig');

describe('getMaterialCharsFieldConfig', () => {
  it('should return correct config based on type', () => {
    expect(getMaterialCharsFieldConfig('s')).toEqual('ContinuingMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('a')).toEqual('BookMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('t')).toEqual('BookMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('m')).toEqual('ComputerFileMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('e')).toEqual('MapMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('f')).toEqual('MapMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('c')).toEqual('MediaMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('d')).toEqual('MediaMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('i')).toEqual('MediaMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('j')).toEqual('MediaMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('g')).toEqual('VisualMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('k')).toEqual('VisualMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('o')).toEqual('VisualMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('r')).toEqual('VisualMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('p')).toEqual('MixedMaterialCharsFieldConfig');
    expect(getMaterialCharsFieldConfig('1')).toEqual('UnknownMaterialCharsFieldConfig');
  });
});
