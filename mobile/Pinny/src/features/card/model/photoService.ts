import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

import {
  PHOTO_JPEG_QUALITY,
  PHOTO_MAX_EDGE,
  PHOTO_PICK_LIMIT,
  PHOTO_THUMBNAIL_WIDTH,
} from '@/constants/limits';
import { createId } from '@/utils/id';

import { photoUri } from './photoFiles';

// Permissão da câmera: ainda não perguntada, liberada ou negada (o sistema não pergunta de novo;
// só nos Ajustes do iPhone).
export type CameraAccess = 'undetermined' | 'granted' | 'denied';

// Foto já guardada no app: os caminhos são relativos à pasta de documentos, porque o caminho
// absoluto do app muda a cada atualização no iOS.
export interface SavedPhoto {
  path: string;
  thumbnailPath: string;
}

// Serviço externo atrás de uma interface (REGRAS.md, regra 1): câmera, galeria, edição da imagem
// e arquivos. O ViewModel não conhece as bibliotecas.
export interface PhotoService {
  cameraAccess(): Promise<CameraAccess>;
  // Mostra o pedido do sistema. true = liberada.
  requestCameraAccess(): Promise<boolean>;
  // null = o usuário cancelou.
  takePhoto(): Promise<SavedPhoto | null>;
  // A galeria do iOS (PHPicker) não precisa de permissão: só a foto escolhida chega ao app.
  pickPhotos(): Promise<SavedPhoto[] | null>;
  // Endereço para mostrar a foto (caminho guardado → arquivo atual).
  uriOf(path: string): string;
  // Tamanho em bytes (null = o arquivo sumiu).
  sizeOf(path: string): number | null;
  // Abre os Ajustes do iPhone na página do Pinny (para liberar a câmera negada antes).
  openSettings(): Promise<void>;
}

const PHOTOS_FOLDER = 'attachments';
const JPEG = 'jpg';

function photosDirectory(): Directory {
  const directory = new Directory(Paths.document, PHOTOS_FOLDER);
  directory.create({ intermediates: true, idempotent: true });
  return directory;
}

// Regrava a imagem como JPEG novo: os metadados (EXIF, inclusive a localização) não vão junto.
async function saveAs(
  uri: string,
  name: string,
  resize: { width?: number; height?: number } | null,
): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  if (resize) context.resize(resize);
  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: PHOTO_JPEG_QUALITY });
  // A imagem gerada fica no cache (o iOS pode apagar): vai para a pasta de documentos do app.
  const destination = new File(photosDirectory(), name);
  await new File(result.uri).move(destination);
  return `${PHOTOS_FOLDER}/${name}`;
}

async function savePhoto(asset: ImagePicker.ImagePickerAsset): Promise<SavedPhoto> {
  const id = createId();
  const isLandscape = asset.width >= asset.height;
  const isLarge = Math.max(asset.width, asset.height) > PHOTO_MAX_EDGE;
  const fullSize = isLarge
    ? isLandscape
      ? { width: PHOTO_MAX_EDGE }
      : { height: PHOTO_MAX_EDGE }
    : null;
  const path = await saveAs(asset.uri, `${id}.${JPEG}`, fullSize);
  const thumbnailPath = await saveAs(asset.uri, `${id}-thumb.${JPEG}`, {
    width: PHOTO_THUMBNAIL_WIDTH,
  });
  return { path, thumbnailPath };
}

// Só fotos, sem vídeo nem Live Photo, e sem pedir o EXIF.
const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  exif: false,
  quality: 1,
};

export const photoService: PhotoService = {
  async cameraAccess() {
    const permission = await ImagePicker.getCameraPermissionsAsync();
    if (permission.granted) return 'granted';
    return permission.canAskAgain ? 'undetermined' : 'denied';
  },

  async requestCameraAccess() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return permission.granted;
  },

  async takePhoto() {
    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (result.canceled) return null;
    const [asset] = result.assets;
    return asset ? savePhoto(asset) : null;
  },

  async pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      ...pickerOptions,
      allowsMultipleSelection: true,
      selectionLimit: PHOTO_PICK_LIMIT,
    });
    if (result.canceled) return null;
    const saved: SavedPhoto[] = [];
    for (const asset of result.assets) saved.push(await savePhoto(asset));
    return saved;
  },

  uriOf(path) {
    return photoUri(path);
  },

  sizeOf(path) {
    const file = new File(Paths.document, path);
    return file.exists ? file.size : null;
  },

  openSettings() {
    return Linking.openSettings();
  },
};
