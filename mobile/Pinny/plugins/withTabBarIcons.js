// Config plugin: copia os ícones da tab bar (SVG) para o Images.xcassets do iOS a cada prebuild.
// No catálogo, o SVG continua vetor ("preserves-vector-representation") e fica nítido em qualquer
// tamanho. Cada ícone gera duas versões já coloridas, em modo "original":
// - "tab-x": contorno cinza (não focado), a partir de tab-x.svg;
// - "tab-x-active": versão preenchida em roxo (focado), a partir de tab-x-active.svg.
// Assim o Liquid Glass não troca as cores, e a aba ativa não depende só de cor (forma cheia).
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const tabBarColors = require('./tabBarColors');

const ICONS_DIR = path.join('assets', 'images', 'tabs');
const ACTIVE_SUFFIX = '-active';
// Os SVGs do Figma têm 21pt; na tab bar sem rótulos eles aparecem com 26pt.
const ICON_SIZE = 26;

function writeImageSet(assetsDir, imageSetName, svgContent) {
  const imageSetDir = path.join(assetsDir, `${imageSetName}.imageset`);
  fs.mkdirSync(imageSetDir, { recursive: true });
  fs.writeFileSync(path.join(imageSetDir, `${imageSetName}.svg`), svgContent);
  fs.writeFileSync(
    path.join(imageSetDir, 'Contents.json'),
    JSON.stringify(
      {
        images: [{ filename: `${imageSetName}.svg`, idiom: 'universal' }],
        info: { author: 'xcode', version: 1 },
        properties: {
          'preserves-vector-representation': true,
          'template-rendering-intent': 'original',
        },
      },
      null,
      2,
    ),
  );
}

// Muda só o tamanho de exibição da raiz <svg>; o viewBox mantém o desenho proporcional.
function withSize(svgContent, size) {
  return svgContent.replace(
    /<svg([^>]*?)width="[^"]*"([^>]*?)height="[^"]*"/,
    `<svg$1width="${size}"$2height="${size}"`,
  );
}

// Ícone de contorno (Figma): todo traço fica com a cor informada.
function withStrokeColor(svgContent, color) {
  return svgContent.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
}

// Ícone preenchido: troca os marcadores {{active}} e {{cutout}} pelas cores reais.
function withPlaceholders(svgContent) {
  return svgContent
    .replaceAll('{{active}}', tabBarColors.active)
    .replaceAll('{{cutout}}', tabBarColors.cutout);
}

module.exports = function withTabBarIcons(config) {
  return withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const { projectRoot, platformProjectRoot, projectName } = modConfig.modRequest;
      const assetsDir = path.join(platformProjectRoot, projectName, 'Images.xcassets');
      const iconsDir = path.join(projectRoot, ICONS_DIR);
      const read = (file) =>
        withSize(fs.readFileSync(path.join(iconsDir, file), 'utf8'), ICON_SIZE);

      fs.readdirSync(iconsDir)
        .filter((file) => file.endsWith('.svg') && !file.endsWith(`${ACTIVE_SUFFIX}.svg`))
        .forEach((file) => {
          const name = path.basename(file, '.svg');
          const activeFile = `${name}${ACTIVE_SUFFIX}.svg`;
          const activeSvg = fs.existsSync(path.join(iconsDir, activeFile))
            ? withPlaceholders(read(activeFile))
            : withStrokeColor(read(file), tabBarColors.active);

          writeImageSet(assetsDir, name, withStrokeColor(read(file), tabBarColors.inactive));
          writeImageSet(assetsDir, `${name}${ACTIVE_SUFFIX}`, activeSvg);
        });

      return modConfig;
    },
  ]);
};
