// Imports de imagem resolvidos pelo Metro (ex.: import photo from '@/assets/images/x.jpg').
declare module '*.jpg' {
  import type { ImageSourcePropType } from 'react-native';
  const source: ImageSourcePropType;
  export default source;
}

declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';
  const source: ImageSourcePropType;
  export default source;
}

// Migrações do Drizzle importadas como texto (babel-plugin-inline-import).
declare module '*.sql' {
  const content: string;
  export default content;
}
