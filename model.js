import * as io from './io.js'
import * as utils from './utils.js'
import * as localisation from './localisation.js'
import {isDay} from './tokenizer.js';
/*
* read, store, manipulate and save data from de eu4 config files
*/
export class Model {

    constructor(mod,readonly) {
        this.mod = mod;
        this.readonly = readonly;
        this.countriesHistoryNew = [];
        this.countriesNew = [];
    }

    clear() {
        if(this.readonly) {
            console.log('clear');
        } else {
            io.clear(this.mod);
        }
    }
    
    getCountries() {
        if(this.countries===undefined) {
            this.countries = io.listObjects(['common','countries'])
        }
        return this.countries;        
    }

    getCountriesTags() {
        if(this.countriesTags===undefined) {
            this.countriesTags = io.readObject(['common','country_tags','00_countries.txt']);
        }
        return this.countriesTags;
    }

    getCountriesHistory() {
        if(this.countriesHistory===undefined) {
            this.countriesHistory = io.listObjects(['history','countries']);
        }
        return this.countriesHistory;
    }
    
    getProvinces() {
        if(this.provinces===undefined) {
            this.provinces = io.listObjects(['history','provinces']);
        }
        return this.provinces;
    }

    getCultures() {
        if(this.cultures===undefined) {
            this.cultures = io.readObject(['common','cultures','00_cultures.txt']);
        }
        return this.cultures;
    }

    // TODO: support other languages, blacklist
    getLocalization(key) {
        if(this.localisations===undefined) {
            this.localisations = localisation.load();
        }   
        return  this.localisations.get(key);   
    }

    nextCountryTag() {
        if(this.currentCountryTag===undefined) {
            this.currentCountryTag = 'XAA';
            this.forbiddenCountryTags = ['ADD', 'ADM', 'AND', 'ART', 'AUX', 'CAR', 'CAV', 'CON', 'DIP', 'HRE', 
            'INF', 'MIL', 'NOT', 'NUL', 'PRN', 'RGB', 'SUM', 'VAL', 'VAN'].
            concat(Object.keys(this.getCountriesTags().value));
        }

        function nextChar(c) {
            return String.fromCharCode(c.charCodeAt() + 1);
        }
    
        const c1 = this.currentCountryTag.charAt(0);
        const c2 = this.currentCountryTag.charAt(1);
        const c3 = this.currentCountryTag.charAt(2);
        if(c3==='Z') {
            if(c2=='Z') {
                this.currentCountryTag = nextChar(c1)+'AA';
            } else {
                this.currentCountryTag = c1+nextChar(c2)+'A';
            }
        } else {
            this.currentCountryTag = c1+c2+nextChar(c3);
        }

        if(this.forbiddenCountryTags.includes(this.currentCountryTag)) {
            //console.log('discard',currentTag);
            return this.nextCountryTag();
        } else {
            return this.currentCountryTag;
        }
    }
    
    getExistingCountriesNames() {
        return this.getCountries().map(x=>x.name);
    }

    // TODO: support other languages
    getCountriesLocalisation() {
        if(this.countriesLocalisation===undefined) {
            this.countriesLocalisation = io.read(['localisation','countries_l_english.yml'],io.YML_ENC);
        }
        return this.countriesLocalisation;
    }

    appendNewcountry(tag,name,fileName,country,countryHistory) {
        this.getCountriesTags().value[tag]=`"countries/${fileName}.txt"`
        io.ymlConcatEntry(this.getCountriesLocalisation(),tag,name);
        io.ymlConcatEntry(this.getCountriesLocalisation(),tag+'_ADJ',name);

        const newHistory = {
            path:['history','countries',`${tag} - ${name}.txt`],
            value: countryHistory
        }
        this.countriesHistoryNew.push(newHistory); 

        const newCountry = {
            path:['common','countries',`${fileName}.txt`],
            value: country
        }

        this.countriesNew.push(newCountry); 
    }

    saveNewCountries() {
        if(this.readonly) {
            console.log('saving new countries',this.countriesNew.length,this.countriesHistoryNew.length,
            this.countriesNew[0].path);
        } else {            
            io.writeObject(this.mod,this.getCountriesTags());
            io.write(this.mod,this.getCountriesLocalisation(),io.YML_ENC)
            io.writeObjects(this.mod,this.countriesHistoryNew);
            io.writeObjects(this.mod,this.countriesNew);
        }
    }

    getDevelopment(province) {
        return province.value.base_tax + province.value.base_production + province.value.base_manpower;
    }

    getMostDeveloped(provinces) {
        let maxid;
        let maxvalue = 0;
        for(let province of provinces) {
            if(this.getDevelopment(province)>maxvalue) {
                maxvalue = this.getDevelopment(province);
                maxid = this.getProvinceId(province);
            }
        }
        return maxid;
    }    

    getProvinceId(province) {
        return parseInt(province.name.split(' - ')[0]);
    }

    getCountryToCulture() {
        if(this.countryToCulture===undefined) {
            this.calculateCountryXCulture();
        }
        return this.countryToCulture;
    }


    getCultureToCountry() {
        if(this.cultureToCountry===undefined) {
            this.calculateCountryXCulture();
        }
        return this.cultureToCountry;
    }

    calculateCountryXCulture() {
        const countries = {}
        const cultures = {}
        for(let province of this.getProvinces()) {
            let culture = province.value.culture;
            let cores = [];
            if(Array.isArray(province.value.add_core)) {
                cores = cores.concat(province.value.add_core);
            } else if(province.value.add_core) {
                cores.push(province.value.add_core);
            } else if(province.value.owner) {
                cores.push(province.value.owner);
            }
            //console.log(province.name,cores)
            for(let core of cores) {
                if(!countries[core]) {
                    countries[core] = [];
                    countries[core].total = 0;
                } 
                countries[core].total = countries[core].total + this.getDevelopment(province);
                
                const obj = countries[core].find(x=>x.key===culture);
                if(obj) {   
                    obj.value = obj.value+this.getDevelopment(province);
                } else {
                    countries[core].push({key:culture,value:this.getDevelopment(province)});
                }
    
                if(!cultures[culture]) {
                    cultures[culture] = [];
                    cultures[culture].total = 0;
                }
                cultures[culture].total =  cultures[culture].total + this.getDevelopment(province);
                const obj2 = cultures[culture].find(x=>x.key===core);
                if(obj2) {   
                    obj2.value = obj2.value+this.getDevelopment(province);
                } else {
                    cultures[culture].push({key:core,value:this.getDevelopment(province)});
                }
            }
        }
    
        for(let list of Object.values(countries)) {
            list.sort((a,b)=>b.value-a.value);
        }
        for(let list of Object.values(cultures)) {
            list.sort((a,b)=>b.value-a.value);
        }
    
        this.countryToCulture=countries;
        this.cultureToCountry=cultures;
    }

    saveProvinces() {
        if(this.readonly) {
            console.log('saveProvinces')
        } else {
            io.writeObjects(this.mod,this.getProvinces());
        }
    }


    saveCultures() {
        if(this.readonly) {
            console.log('saveCultures')
        } else {
            io.writeObject(this.mod,this.getCultures());
        }
    }


    copyFlag(from,to) {
        if(this.readonly) {
            //NOP console.log('copyFlag')
        } else {
            io.copyAs(this.mod,['gfx','flags'],from+'.tga',to+'.tga');
        }
    }
    
    createMonochromaticFlag(tag,color) {
        if(this.readonly) {
            //NOP console.log('createMonochromaticFlag')
        } else {
            io.createImg(this.mod,tag,color);
        }
    }

    removeDays(obj) {
        Object.keys(obj).forEach(key=>{
            if(isDay(key)) {
                delete obj[key];
            }
        });
        return obj;
    }

    getCountry(tag) {
        const fileName = this.getCountriesTags().value[tag];
        if(!fileName) return;
        const name = fileName.replace('"countries/','').replace('.txt"','');
        return this.getCountries().find(c=>c.name.indexOf(name)!==-1);
    }

    getCountryHistory(tag){
        return this.getCountriesHistory().find(c=>c.name.indexOf(tag+' - ')!==-1);
    }

    getCulture(name) {
        for(let macro of Object.values(this.getCultures().value)) {
            if(macro[name]) {
                return macro[name];
            }
        }
        return;
    }
}

