// Resolver do Jest: junta o do preset do Expo (React Native) com o do Reanimated.
// - O do Reanimated (que cobre o Worklets) escolhe os arquivos que rodam em JavaScript, sem os
//   módulos nativos: fora do aparelho não existe a UI thread.
// - O do preset continua valendo para todo o resto (subcaminhos do react-native).
const preset = require('jest-expo/jest-preset');
const reanimatedResolver = require('react-native-reanimated/jest/resolver');

const presetResolver = require(preset.resolver);

module.exports = (request, options) =>
  reanimatedResolver(request, {
    ...options,
    defaultResolver: (innerRequest, innerOptions) =>
      presetResolver(innerRequest, { ...innerOptions, defaultResolver: options.defaultResolver }),
  });
