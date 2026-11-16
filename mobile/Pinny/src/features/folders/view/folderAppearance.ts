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

import { labelInkColor } from '@/components/Chip';
import type { LabelColor } from '@/features/card/model/card.types';

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

// Fundo pastel da pasta (ex.: selo do ícone no topo da tela da pasta).
export const folderBackgroundClass: Record<LabelColor, string> = {
  lavender: 'bg-lavender',
  mint: 'bg-mint',
  peach: 'bg-peach',
  babyBlue: 'bg-baby-blue',
  butter: 'bg-butter',
};

// Cor escura do acento: ícone da pasta e notas da miniatura dos quadros.
export const folderInkColors = labelInkColor;
