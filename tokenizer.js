const QUOTE = '"'
const COMMENT = '#'
const IGNORE = /^\s$/
const ID = /[\u009A\u009e\u0092\u008A0-9a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸøðÞšžŠÆ_’`'.-]/
const INTEGER = /^-?[0-9]+$/
const FLOAT = /^-?[0-9]+\.[0-9]+$/
const DAY = /^[0-9]+\.[0-9]+\.[0-9]+$/


export function isDay(text) {
	return text.match(DAY)
}

export function tokenize(str) {
	var tokens = []
	var buffer = '';
	var quote = false
	var comment = false;
	for (let i = 0; i < str.length; i++) {
		var c = str[i];
		COMMENT
		if(comment && c == '\n') {
			comment = false;
		} else if(comment) {
			// NOP
		} else if(!quote && c === COMMENT) {
			comment = true;
		} else if(quote && c != QUOTE) {
			buffer = buffer + c
		} else if(quote && c == QUOTE) {
			tokens.push({kind:'quote',value:buffer});
			quote = false;
			buffer = '';
		} else if(!quote && c == QUOTE) {
			 quote = true
		} else if(c.match(IGNORE)) {
			if(buffer != '') {
				tokens.push(get(buffer));
				buffer = '';
			}
		} else if(!c.match(ID)) {
			if(buffer != '') {
				tokens.push(get(buffer));
				buffer = '';
			}
			tokens.push({kind:'symbol',value:c});
		} else {
			buffer = buffer + c
		}
		
	}
	if(buffer != '') {
		tokens.push(get(buffer))
	}
	
	return tokens;
}

function get(text) {
	if(text.match(INTEGER)) {
		return {kind:'number',value:parseInt(text)};
	} else if(text.match(DAY)) {
		return {kind:'day',value:text};
	} else if(text.match(FLOAT)) {
		return {kind:'number',value:parseFloat(text)};
	} else {
		return {kind:'id',value:text};
	}
}

export class TokenConsumer {
	
	constructor(tokens) {
		this.tokens = tokens;
		this.index=0;
	}
	
    bookmark() { return this.index};
         
    goto(index) {this.index=index}
        
    consume(kind,include,exclude) {
		//console.log('consume',kind,include,exclude,this.index,this.tokens.length)
        if(this.isFinished()) {
            return;
		} else {
			let token = this.tokens[this.index];
			//console.log('token',token);
			if(kind && !kind.includes(token.kind)) {
				return;
			} else if(include && !include.includes(token.value)) {
				return;
			} else if(exclude && exclude.includes(token.value)) {
				return;
			}
			this.index = this.index+1;
			return token;
		}
	}
    
    text(i,f) {
		return this.tokens.slice(i===undefined?this.index:i,f||this.tokens.length).map(x=>x.value);
	}
	
    isFinished() {
        return this.index >= this.tokens.length;
	}

}

