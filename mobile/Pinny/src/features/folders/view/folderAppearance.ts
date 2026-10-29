import {
  BookOpen,
  Briefcase,
  Folder,
  Heart,
  House,
  Lightbulb,
  type LucideIcon,
  Plane,
  Star,
} from 'lucide-react-native';

import type { LabelColor } from '@/features/card/model/card.types';
import { colors } from '@/theme';

import type { FolderIcon } from '../model/folder.schema';

export const folderIcons: Record<FolderIcon, LucideIcon> = {
  folder: Folder,
  briefcase: Briefcase,
  heart: Heart,
  lightbulb: Lightbulb,
  book: BookOpen,
  plane: Plane,
  house: House,
  star: Star,
};

// Cor escura do acento: ícone da pasta e notas da miniatura dos quadros.
export const folderInkColors: Record<LabelColor, string> = {
  lavender: colors.lavenderInk,
  mint: colors.mintInk,
  peach: colors.peachInk,
  babyBlue: colors.babyBlueInk,
  butter: colors.butterInk,
};
