// Compila arquivos com o React Compiler (como o Metro faz no app) e mostra, por arquivo, quantos
// valores ele memoizou e onde ele desistiu ("bailout"). Um bailout num componente do quadro
// (ex.: SortableColumn) ou num hook que monta o `drag` quer dizer que nada ali é memoizado e
// todas as colunas e cartões redesenham a cada render. Uso: npm run compiler:check -- <arquivos>
const path = require('path');
const babel = require('@babel/core');

const root = path.resolve(__dirname, '..');
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Uso: npm run compiler:check -- src/caminho/Arquivo.tsx [...]');
  process.exit(1);
}

let bailouts = 0;
const logger = {
  logEvent(filename, event) {
    if (event.kind !== 'CompileError' && event.kind !== 'CompileSkip') return;
    bailouts += 1;
    const detail = event.detail?.options ?? event.detail ?? {};
    const line = detail.details?.[0]?.loc?.start?.line ?? detail.loc?.start?.line ?? '?';
    const reason = detail.reason ?? event.reason ?? event.kind;
    console.log(`  BAILOUT ${path.relative(root, filename)}:${line} ${reason}`);
  },
};

for (const file of files) {
  const filename = path.resolve(root, file);
  const { code } = babel.transformFileSync(filename, {
    cwd: root,
    root,
    filename,
    configFile: false,
    babelrc: false,
    compact: false,
    caller: { name: 'metro', platform: 'ios', isDev: false, supportsReactCompiler: true },
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      ['babel-plugin-react-compiler', { target: '19', logger }],
      ['inline-import', { extensions: ['.sql'] }],
    ],
  });
  const slots = (code.match(/\$\[\d+\]/g) ?? []).length;
  console.log(`${path.relative(root, filename)}: ${slots} valores memoizados`);
}

if (bailouts > 0) {
  console.log(`\n${bailouts} bailout(s). Com o compiler pulando o arquivo, nada nele é memoizado.`);
  process.exit(1);
}
