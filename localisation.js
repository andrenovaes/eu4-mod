import * as io from './io.js'
import * as tokenizer from './tokenizer.js'
import * as path from 'path';

const whitelist = [
    '1283',
    'aow',
    'areas_regions',
    'common_sense',
    'conquest_of_constantinople',
    'core',
    'cossacks',
    'countries',
    'cradle_of_civilization',
    'cultures_phase4',
    'customocalisation',
    'decisions',
    'dharma',
    'diplomacy',
    'diplomatic_action',
    'diplo_reasons',
    'eldorado',
    'emperor_content',
    'emperor_estates',
    'emperor',
    'emperor_map',
    'EU4',
    'golden_century',
    'government',
    'government_names',
    'institutions',
    'ledger',
    'manchu',
    'mandate_of_heaven',
    'mare_nostrum',
    'mercantilism',
    'messages',
    'missions',
    'modifers',
    'mughal_government',
    'musicplayer',
    'muslim_dlc',
    'native_flavor_events',
    'new_missions',
    'notlocalized',
    'nw2',
    'nw',
    'personalityoptions',
    'policies',
    'popserror',
    'powers_and_ideas',
    'privateers',
    'prov_names_adj',
    'prov_names',
    'Purple_Phoenix',
    'random_new_world',
    'red_queen_text',
    'regions_phase4',
    'religion',
    'res_publica',
    'richpresence',
    'rights_of_man',
    'rule_britannia',
    'rus_awaken',
    'social',
    'subject_type',
    'tags_phase4',
    'text',
    'third_rome',
    'tradenodes',  
]

export function load() {
    const names = new Map()
    for(let file of io.listWithDir('localisation').filter(f=>f.indexOf('_l_english.yml')!=-1 
    && whitelist.includes(path.basename(f).replace('_l_english.yml',''))
    )) {
        const loc = io.read(file,io.YML_ENC);
        for(let line of loc.value.split('\n')) {
            const tokens = tokenizer.tokenize(line);    
            //console.log()
            if(tokens.length===4) {
                names.set(tokens[0].value,tokens[3].value);
            }
        }
    }
    return names;
}