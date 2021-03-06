import { Model } from "./model";
import * as path from 'path';

let model;

beforeEach(() => {
    model = new Model('');
});


test('getCountries', () => {
    const r1 = model.getCountries();
    expect(r1.filter(x=>x.name==='Brazil')).toHaveLength(1);
    // test if is the same
    const r2 = model.getCountries();
    expect(r2).toBe(r1);
});

test('getCountriesHistory', () => {
    const r1 = model.getCountriesHistory();
    expect(r1.filter(x=>x.name==='BRZ - Brazil')).toHaveLength(1);
});

test('getProvinces', () => {
    const r1 = model.getProvinces();
    expect(r1.filter(x=>x.name.indexOf('Pernambuco')!==-1)).toHaveLength(1);    
});

test('getCountriesTags', () => {
    const tags = model.getCountriesTags();
    expect(tags.value['VEN']).toBe('"countries/Venice.txt"');
});

test('getLocalization', () => {
    const r1 = model.getLocalization('english');
    expect(r1).toBe('English');
});

test('getCultures', () => {
    const r1 = model.getCulture('polish');
    expect(r1.primary).toBe('POL');
});

test('appendNewCountry', () => {
    model.appendNewcountry('HAXX','HAHAXX','HAHAHAXXX',{a:1},{b:1});
    expect(model.getCountriesTags().value['HAXX']).toBe(`"countries/HAHAHAXXX.txt"`);
    expect(model.getCountriesLocalisation().value).toMatch(/HAXX:0 ".*HAHAXX".*/);
    expect(model.countriesNew[0].value.a).toBe(1);
    expect(model.countriesHistoryNew[0].value.b).toBe(1);
});

test('getMostDeveloped', () => {
    const r1 = model.getMostDeveloped([
        {name:'111 - ha.txt',value:{base_tax:1,base_production:3,base_manpower:5}},
        {name:'222 - he.txt',value:{base_tax:9,base_production:3,base_manpower:5}},
        {name:'333 - hi.txt',value:{base_tax:1,base_production:1,base_manpower:5}}
    ]);
    expect(r1).toBe(222);
});

test('getDevelopment', () => {
    const r1 = model.getDevelopment({value:{base_tax:1,base_production:3,base_manpower:5}});
    expect(r1).toBe(9);
});


test('getCultureToCountry', () => {
    const r1 = model.getCultureToCountry()['catalan'];
    expect(r1[0].key).toBe('ARA');
});

test('getCountryToCulture', () => {
    const r1 = model.getCountryToCulture()['ARA'];
    expect(r1[0].key).toBe('catalan');
});

test('getCountry', () => {
    const r1 = model.getCountry('ENG');
    expect(r1.name).toBe('England');
});


test('getCountryHistory', () => {
    const r1 = model.getCountryHistory('ENG');
    expect(r1.name).toBe('ENG - England');
});