/*
 * read, parse and write config files
 */
import * as fs from 'fs';
import * as path from 'path';
import * as grammar from './grammar.js'
import * as printer from './printer.js'
import { SOURCE, TARGET } from './config.js'
import TGA from 'tga';

export const TXT_ENC = 'latin1';
export const YML_ENC = 'utf8';

/*
* crear subfolders
*/
export const clear = (mod) => {
  const dirs = fs.readdirSync(path.join(TARGET, mod), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  for (let dir of dirs) {
    fs.rmdirSync(path.join(TARGET, mod, dir), { recursive: true });
  }
}

export const toName = (p) => path.basename(p).slice(0, -4);

export const listWithDir = (dir) => fs.readdirSync(path.join(SOURCE, toPath(dir))).map(file => path.join(toPath(dir), file));

//'utf-8'
export const read = (file, enc, apply = _ => _) => ({ path: toPath(file), name: toName(toPath(file)), value: apply(fs.readFileSync(path.join(SOURCE, toPath(file)), enc)) });

export const listObjects = (dir) => listWithDir(toPath(dir)).map(file => read(file,TXT_ENC, c => grammar.parse(c)));

export const readObject = (file) => read(toPath(file), TXT_ENC,c => grammar.parse(c));

export const writeObjects = (mod, list) => list.forEach(obj => writeObject(mod, obj));

export const writeObject = (mod, obj) => write(mod, obj, TXT_ENC, v => printer.print(v));

export const write = (mod, obj, enc, apply = _ => _) => {
  fs.mkdirSync(path.join(TARGET, mod, path.dirname(toPath(obj.path))), { recursive: true });
  fs.writeFileSync(path.join(TARGET, mod, toPath(obj.path)),apply(obj.value),enc);
}

export const copyAs = (mod, dir, source, target) => {
  fs.mkdirSync(path.join(TARGET, mod, toPath(dir)), { recursive: true });
  fs.copyFileSync(path.join(SOURCE, toPath(dir), source), path.join(TARGET, mod, toPath(dir), target));
}

export const copyEmpty = (mod, dir) => {
  for (let src of listWithDir(dir)) {
    write(mod, { path: src, value: '' }, TXT_ENC);
  }
}

export const createImg = (mod, tag, color) => {
  var tga = new TGA(fs.readFileSync(path.join(SOURCE, 'gfx', 'flags', 'ANZ.tga')));
  for (var i = 0; i < tga.pixels.length; i += 4) {
    tga.pixels[i] = color[0];
    tga.pixels[i + 1] = color[1];
    tga.pixels[i + 2] = color[2];
    tga.pixels[i + 3] = 255;
  }

  var buf = TGA.createTgaBuffer(tga.width, tga.height, tga.pixels);
  fs.mkdirSync(path.join(TARGET, mod, 'gfx', 'flags'), { recursive: true });
  fs.writeFileSync(path.join(TARGET, mod, 'gfx', 'flags', `${tag}.tga`), buf);
}

export const toPath = (x) => {
  if (Array.isArray(x)) {
    return path.join.apply(null, x);
  } else {
    return x;
  }
}

export function ymlConcatEntry(obj, name, value) {
  obj.value = obj.value + ` ${name}:0 "${value}"\n`;
}
