import * as fs from 'fs'
import * as io from './io.js'
import * as grammar from './grammar.js'
import * as tokenizer from './tokenizer.js'
import * as model from './model.js'

//let c = fs.readFileSync('D:\\Projects\\eu4\\temp.txt', 'latin1');
//c = c.replace(/\u009A/g,'S').replace(/\u009e/g,'z').replace(/\u0092/g,"`").replace(/\u008A/g,"s");
//Š s ž ’
//fs.writeFileSync('D:\\Projects\\eu4\\temp2.txt', c, 'latin1')

//console.log([...new Set(tokenizer.tokenize(c).filter(x=>x.kind==='symbol').map(x=>x.value))]);

const m = new model.Model('',true)
//.value['byzantine']['greek']
console.log(Object.keys(m.getCultures().value))

//console.log(Object.keys(grammar.parse(c)));