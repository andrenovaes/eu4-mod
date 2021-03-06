/**
 * One coutry per culture
 */
import * as io from './io.js'
import * as utils from './utils.js'
import * as localisation from './localisation.js'
import { Model } from './model.js';
 
export function make(mod) {

    const model = new Model(mod,true);

    model.clear();

    // delete decisions
    io.copyEmpty(mod,'decisions');

    const cultureMap = utils.toMap(model.getProvinces(),x=>x.value.culture);

    const results = [];
    for (let [key, value] of cultureMap) {
        const res = createCountry(model,key,model.getLocalization(key),value);
        if(res) {
            results.push(res);
        } else {
            // not possible to create country to this culture
        }
    }

    model.saveProvinces();
    model.saveNewCountries();
    model.saveCultures()
}

/**
 * Create country
 */
function createCountry(model,key,name,provinces) {
        
    const {baseTag,isBaseOwnser} = getBaseCountry(model,key);
    if(!baseTag) return;

    const tag = model.nextCountryTag();
    
    const countryHistory = model.getCountryHistory(baseTag);
    
    const country = model.getCountry(baseTag);

    if(!countryHistory || !country) return;

    const culture = model.getCulture(key);
    culture.primary = tag; 
    //console.log(key,(culture||{}).primary)

    const newHistory = utils.copyProperties(countryHistory.value,['government','add_government_reform','technology_group','religion','religious_school']);
    newHistory.capital = model.getMostDeveloped(provinces);
    newHistory.primary_culture = key;
    newHistory.government_rank = 1;   
    const firstKing = culture.male_names?culture.male_names[0]:'Unknow'; 
    newHistory['1440.1.1']={monarch:{name:firstKing,adm:3,dip:3,mil:3}}

    const newCountry = Object.assign({},country.value);
    if(isBaseOwnser) {
        model.copyFlag(baseTag,tag);
    } else {
        newCountry.color = utils.nextColor();
        newCountry.color.inline = true; // hint to printer
        model.createMonochromaticFlag(tag,newCountry.color)
    }

    model.appendNewcountry(tag,name,`${name}Culture`,newCountry,newHistory)

    provinces.forEach(province=>{
        model.removeDays(province.value)
        province.value.owner = tag;
        province.value.controller = tag;
        province.value.add_core = tag;
        province.value.hre = 'no';
    });

    
    return {tag,baseTag,isBaseOwnser,key,newCountry};
}


/*
* choose most relevante country to this culture
*/
function getBaseCountry(model,culture) {
        
    let candidates = [];

    for(let tag of Object.keys(model.getCountryToCulture())) {
        const country = model.getCountryToCulture()[tag];
        if(country[0].key===culture && country[0].value>country.total/2) {
            candidates.push({key:tag,value:country[0].value});
        }
    }
    candidates.sort((a,b)=>b.value-a.value);

    if(candidates.length>0) {
        return {baseTag:candidates[0].key,isBaseOwnser:true};
    } else if(model.getCultureToCountry()[culture] && model.getCultureToCountry()[culture].length>0) {
        return {baseTag:model.getCultureToCountry()[culture][0].key,isBaseOwnser:false};
    } else {
        return {baseTag:undefined,isBaseOwnser:undefined};
    }   
}