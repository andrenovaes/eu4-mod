import {tokenize,TokenConsumer} from './tokenizer.js';

function grammar(text) {

	let tokens = new TokenConsumer(tokenize(text))
	
	let ident = 0; 

	function log(x) {
		//console.log(">".repeat(ident),x)
	}

	function isNotNull(x) {
		return x!==undefined;
	}

	function consume() {
		return consumeAttibutes();
	}

	function consumeAttibutes() {
		log(['consumeAttibutes']);
		ident++;
		const values = {};
		while(true) {
			let value = consumeAttribute();
			if(isNotNull(value)) {
				const key = value[0];
				if(values[key]) {
					if(Array.isArray(values[key])) {
						values[key].push(value[1]);
					} else {
						values[key] = [values[key],value[1]]
						values[key].inline = false;
					}
				} else {
					values[key]=value[1];
				}
			} else {
				if(Object.keys(values).length===0) return;
				break;
			}
		}
		ident--;
		return values;
	}

	function consumeAttribute() {
		return consumeAll(
			(k,_,v)=>[k,v],
			consumePrimitive,
			()=>tokens.consume(['symbol'],['=']),
			()=> {
				ident++;	
				const value = consumeChoices([consumeObj,consumeList,consumePrimitive]);
				ident--;
				return value;
			}

		);
	}

	function consumePrimitives() {
		log(['consumePrimitives']);
		ident++;
		const values = [];
		values.inline = true;
		while(true) {
			let value = consumePrimitive();
			if(isNotNull(value)) {
				values.push(value);
			} else {
				break;
			}
		}
		ident--;
		return values;
	}

    function consumeChoices(choices) {
        for(let i=0;i<choices.length;i++) {
			let supplier = choices[i];
            let exp = consumeChoice(supplier);
            if(isNotNull(exp)) return exp;
		}
        return;
	}
        
    function consumeChoice(consumer) {
        let bookmark = tokens.bookmark();
		
		let value = consumer();
		log(['consumeChoice',consumer,value]);
        if(!isNotNull(value)) {
            tokens.goto(bookmark);
		} 
        return value;
	}

	function consumePrimitive() {
		return consumeAll(
			token=>token.kind==='quote'?'"'+token.value+'"':token.value,
			()=>tokens.consume(['id','number','quote','day'])
		);
	}

    function consumeObj() {
		return consumeAll(
			(x,values,y)=>values,
			()=>tokens.consume(['symbol'],['{']),
			()=>consumeAttibutes(),
			()=>tokens.consume(['symbol'],['}'])
		)
	}

    function consumeList() {
		return consumeAll(
			(x,values,y)=>values,
			()=>tokens.consume(['symbol'],['{']),
			()=>consumePrimitives(),
			()=>tokens.consume(['symbol'],['}'])
		)
	}

	function consumeAll(consumers,creator) {
		let values = [];
		for(let i=1;i<arguments.length;i++) {
			let value = arguments[i]();
			if(value===undefined) {
				return;
			} else {
				values.push(value);
			}
		}
		return arguments[0](...values);
	}

	return {consume};
}

export function parse(text) {
    return grammar(text).consume()||{};
}



