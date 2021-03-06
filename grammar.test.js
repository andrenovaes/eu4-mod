import * as grammar from './grammar.js'
import * as printer from './printer.js'
import dedent from 'dedent-js';

test('primitives', () => {

    const text = dedent(`
    a = y
    b = "y"
    c = 1
    d = 0
    e = 1000.01.01
    f = 0.5`)

    const obj = grammar.parse(text);

    const expected = {
        a :'y',
        b : '"y"',
        c:1,
        d:0,
        e:'1000.01.01',
        f:0.5
    };

    expect(JSON.stringify(obj)).toBe(JSON.stringify(expected));
    expect(printer.print(obj)).toBe(text);
});

test('multiple', () => {
    const text = dedent(`
    a = y
    a = x
    a = z
    `);

    const obj = grammar.parse(text);

    const expected = {
        a : ["y","x","z"],
    };

    expect(JSON.stringify(obj)).toBe(JSON.stringify(expected));
    expect(printer.print(obj)).toBe(text);
});

test('nested', () => {

    const text = dedent(`
    a = {
        ao = 1
    }
    b = x
    1000.09.09 = {
        co = 2
    }
    `);

    const obj = grammar.parse(text);

    const expected = {
        a : {ao:1},
        b:'x',
        '1000.09.09': { co:2 }
    };

    expect(JSON.stringify(obj)).toBe(JSON.stringify(expected));
    expect(printer.print(obj)).toBe(text);
});

test('list', () => { 

    const text = dedent(`
    x = {"b" 1 d'Anjou}
    `);

    const obj = grammar.parse(text);

    expect(obj.x.inline).toBe(true);

    const expected = {x:['"b"',1,"d'Anjou"]};

    expect(JSON.stringify(obj)).toBe(JSON.stringify(expected));
    expect(printer.print(obj)).toBe(text);
});

test('empty object', () => { 

    const text = dedent(`
    x = {}
    `);

    const obj = grammar.parse(text);

    expect(obj.x.inline).toBe(true);

    const expected = {x:[]};

    expect(JSON.stringify(obj)).toBe(JSON.stringify(expected));
    expect(printer.print(obj)).toBe(text);
});