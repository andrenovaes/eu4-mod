export function toMap(list,getKey) {
    const map = new Map();
    list.forEach(obj=>{
        const key = getKey(obj);
        if(key) {
            if(!map.has(key)) map.set(key,[]);
            map.get(key).push(obj);
        }
    });
    return map;
}

export function copyProperties(source,whitelist) {
    return Object.keys(source).reduce((obj, k) => {
        if (whitelist.includes(k)) obj[k] = source[k];
        return obj;
      }, {});
}

export function nextColor(name) {
    return [getRandomInt(200)+50,getRandomInt(200)+50,getRandomInt(200)+50];
}


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
