const SPACE = "    ";

export function print(tree) {
    const linhas = [];
    printAttrs(tree,0,linhas)
    return linhas.join('\n');
}

function printAttrs(node,ident,lines) {
    Object.keys(node).forEach(key=> {
        printAttr(key,node[key],ident,lines);
    });
}

function printAttr(key,value,ident,lines) {
    let str = SPACE.repeat(ident)+key+" = ";

    if(Array.isArray(value)) {
        if(value.length===0)  {
            lines.push(str + "{}");
        } else if(value.inline) {
            lines.push(str + "{"+value.join(' ')+"}");    
        } else {
            value.forEach(v=>{
                printAttr(key,v,ident,lines)
            });
        }
    } else if(isObject(value)) {
        str += "{";
        lines.push(str)
        printAttrs(value,ident+1,lines);
        lines.push(SPACE.repeat(ident)+"}")
    } else {
        lines.push(str + value);
    }        
}

function isObject(val) {
    if (val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
}