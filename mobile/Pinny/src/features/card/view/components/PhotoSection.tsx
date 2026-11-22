import { Button } from '@expo/ui/swift-ui';
import { Image as ImageIcon, Plus } from 'lucide-react-native';
import { ActionSheetIOS, Image, Pressable, Text, View } from 'react-native';

import { IconMenu } from '@/components/IconMenu';
import { Chip } from '@/components/Chip';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import type { CardPhotosViewModel, PhotoItemView } from '../../viewmodel/useCardPhotos';

const text = ptBR.card.photos;
const ADD_ICON_SIZE = 16;
// O "+ Adicionar" tem ~20 de altura; o hitSlop completa a área de toque de 44.
const ADD_HIT_SLOP = 12;
// Ordem das opções da folha de ações do iOS.
const SHEET_OPTIONS = [text.takePhoto, text.chooseFromLibrary, text.cancel];
const TAKE_PHOTO_INDEX = 0;
const LIBRARY_INDEX = 1;
const CANCEL_INDEX = 2;

interface PhotoRowProps {
  photo: PhotoItemView;
  photos: CardPhotosViewModel;
}

function PhotoRow({ photo, photos }: PhotoRowProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photo.accessibilityLabel}
        onPress={() => photos.openPhoto(photo.id)}
        className="flex-1 flex-row items-center gap-3 active:opacity-60"
      >
        <Image
          source={{ uri: photo.thumbnailUri }}
          resizeMode="cover"
          className="h-[60px] w-[72px] rounded-[12px] bg-column-background"
        />
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text numberOfLines={1} className="shrink text-card-title text-text-primary">
              {photo.title}
            </Text>
            {photo.isCover ? (
              <Chip label={text.coverBadge} tone="lavender" icon={ImageIcon} />
            ) : null}
          </View>
          {photo.detail ? (
            <Text className="text-caption text-text-secondary">{photo.detail}</Text>
          ) : null}
        </View>
      </Pressable>
      <IconMenu accessibilityLabel={text.options}>
        <Button label={text.view} systemImage="eye" onPress={() => photos.openPhoto(photo.id)} />
        {photo.isCover ? (
          <Button
            label={text.removeCover}
            systemImage="xmark.circle"
            onPress={photos.removeCover}
          />
        ) : (
          <Button
            label={text.setCover}
            systemImage="photo.badge.checkmark"
            onPress={() => photos.setCover(photo.id)}
          />
        )}
        <Button
          label={text.delete}
          systemImage="trash"
          role="destructive"
          onPress={() => photos.requestDelete(photo.id)}
        />
      </IconMenu>
    </View>
  );
}

interface PhotoSectionProps {
  photos: CardPhotosViewModel;
}

// Fotos do cartão (Figma "Anexos"): "+ Adicionar" abre a folha de ações do iOS (Tirar foto ou
// Escolher da galeria) e cada foto mostra a miniatura, a data e o tamanho, com o "…" (Ver, Usar como
// capa ou Tirar da capa, Apagar). A capa ganha o selo "Capa" e aparece no post-it do quadro.
export function PhotoSection({ photos }: PhotoSectionProps) {
  const openAddSheet = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: SHEET_OPTIONS, cancelButtonIndex: CANCEL_INDEX, tintColor: colors.onSecondary },
      (index) => {
        if (index === TAKE_PHOTO_INDEX) void photos.takePhoto();
        if (index === LIBRARY_INDEX) void photos.pickPhotos();
      },
    );
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text accessibilityRole="header" className="text-subtitle text-text-primary">
          {photos.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={text.addA11y}
          onPress={openAddSheet}
          hitSlop={ADD_HIT_SLOP}
          className="flex-row items-center gap-1 active:opacity-60"
        >
          <Plus size={ADD_ICON_SIZE} color={colors.onSecondary} />
          <Text className="text-label text-on-secondary">{text.add}</Text>
        </Pressable>
      </View>
      {photos.items.length === 0 ? (
        <Text className="text-body text-text-secondary">{text.empty}</Text>
      ) : (
        photos.items.map((photo) => <PhotoRow key={photo.id} photo={photo} photos={photos} />)
      )}
    </View>
  );
}
