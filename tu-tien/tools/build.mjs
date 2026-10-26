// Đóng gói toàn bộ game thành một tệp HTML duy nhất (chơi offline, chia sẻ dễ dàng).
// Cách dùng: node tools/build.mjs [--artifact <đường_dẫn_ra>]
//   Mặc định ghi dist/VanDaoTienDo.html (tài liệu HTML đầy đủ).
//   --artifact: ghi thêm bản không có khung <html>/<head>/<body> để đăng lên Artifact.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const read = (p) => readFileSync(join(root, p), 'utf8');
const safeScript = (code) => code.replace(/<\/script/gi, '<\\/script');

let out = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, p) => '<style>\n' + read(p) + '\n</style>');
const scripts = [];
out = out.replace(/<script src="(js\/[^"]+)"><\/script>\n?/g, (_, p) => { scripts.push(p); return ''; });
const bundle = scripts.map((p) => '/* ===== ' + p + ' ===== */\n' + read(p)).join('\n');
out = out.replace('</body>', '<script>\n' + safeScript(bundle) + '\n</script>\n</body>');

mkdirSync(join(root, 'dist'), { recursive: true });
const full = join(root, 'dist', 'VanDaoTienDo.html');
writeFileSync(full, out);
console.log('Đã ghi', full, (out.length / 1024).toFixed(1) + ' KB');

const ai = process.argv.indexOf('--artifact');
if (ai > 0 && process.argv[ai + 1]) {
  const title = (out.match(/<title>[\s\S]*?<\/title>/) || [''])[0];
  const head = (out.match(/<head>([\s\S]*?)<\/head>/) || ['', ''])[1]
    .replace(/<meta charset[^>]*>\s*/i, '')
    .replace(/<meta name="viewport"[^>]*>\s*/i, '')
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '');
  const body = (out.match(/<body>([\s\S]*?)<\/body>/) || ['', ''])[1];
  const art = title + '\n<meta name="claude:viewport-fit-sides" content="cover">\n' + head.trim() + '\n' + body.trim() + '\n';
  const dest = resolve(process.argv[ai + 1]);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, art);
  console.log('Đã ghi bản Artifact', dest, (art.length / 1024).toFixed(1) + ' KB');
}
