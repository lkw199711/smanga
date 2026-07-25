/**
 * 批量将 src/themes/ 下的 px 单位转换为 rem
 * 规则:1rem = 10px (对应 html { font-size: 62.5% })
 * - 保留 1px 不替换(用于边框发丝)
 * - 保留 0px 不替换
 * - 处理整数与小数
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', 'src', 'themes');
const EXTS = new Set(['.vue', '.css', '.less', '.scss', '.ts', '.js']);

// 匹配数字+px,前面不能紧邻字母/数字/下划线(避免 20pxSomething 之类)
// 允许小数,允许负号
const PX_REGEX = /(^|[^\w.])(-?\d*\.?\d+)px\b/g;

function convert(content) {
  let count = 0;
  const out = content.replace(PX_REGEX, (match, prefix, num) => {
    // 保留 1px、-1px、0px、-0px
    const n = parseFloat(num);
    if (n === 1 || n === -1 || n === 0) {
      return match;
    }
    // 保留原前缀,数字/10,去掉多余的 0
    const remValue = n / 10;
    // 格式化:整数直接输出;小数最多保留4位并去尾零
    let str = remValue.toString();
    if (str.includes('.')) {
      str = parseFloat(remValue.toFixed(4)).toString();
    }
    count++;
    return `${prefix}${str}rem`;
  });
  return { out, count };
}

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, cb);
    else if (e.isFile()) cb(p);
  }
}

let totalFiles = 0;
let changedFiles = 0;
let totalReplacements = 0;
const changedList = [];

walk(ROOT, (file) => {
  const ext = path.extname(file).toLowerCase();
  if (!EXTS.has(ext)) return;
  totalFiles++;
  const original = fs.readFileSync(file, 'utf8');
  const { out, count } = convert(original);
  if (count > 0 && out !== original) {
    fs.writeFileSync(file, out, 'utf8');
    changedFiles++;
    totalReplacements += count;
    changedList.push({ file: path.relative(process.cwd(), file), count });
  }
});

console.log('=== px -> rem conversion done ===');
console.log(`Scanned files: ${totalFiles}`);
console.log(`Changed files: ${changedFiles}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log('\nChanged files detail:');
for (const item of changedList) {
  console.log(`  ${item.count.toString().padStart(4)}  ${item.file}`);
}