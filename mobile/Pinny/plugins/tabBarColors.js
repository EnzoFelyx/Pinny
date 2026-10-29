// COR-HARDCODED: o Images.xcassets é gerado no prebuild (Node) e não lê o tema em TypeScript.
// O Liquid Glass do iOS 26 ignora a cor do item não focado em ícones "template", então os
// ícones da tab bar são gerados já coloridos. Manter igual aos tokens de src/theme/colors.ts:
module.exports = {
  // Ícone não focado: igual a colors.textSecondary (o #827C73 do Figma ficava apagado no vidro).
  inactive: '#6F6A62',
  // Ícone focado: igual a colors.onSecondary.
  active: '#604A80',
  // Detalhes "vazados" dentro do ícone preenchido: igual a colors.surface.
  cutout: '#FFFEFB',
};
