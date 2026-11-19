// Nạp các mô-đun logic (không cần DOM) vào môi trường Node để kiểm thử tự động.
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function load(files = ['js/util.js', 'js/data.js', 'js/world.js'], extra = '', prelude = '') {
  const ctx = { console, Math, Date, performance: { now: () => 0 } };
  vm.createContext(ctx);
  const src = prelude + files.map((f) => readFileSync(join(root, f), 'utf8')).join('\n;\n') +
    '\n;globalThis.__x = { M, RNG, Noise, DATA, Level, Overworld, Dungeon, TILE, T_HAZARD, T_ROCK, T_AIR };' + extra;
  vm.runInContext(src, ctx, { filename: 'game.js' });
  if (ctx.__g) ctx.__x.__g = ctx.__g;
  return ctx.__x;
}
