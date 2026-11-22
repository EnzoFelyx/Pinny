import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { db } from '@/db/client';
import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';
import { openRoute } from '@/navigation/openRoute';
import { createTestRepositories, seedBoard } from '@/test/testRepositories';

import type { Attachment } from '../model/card.schema';
import { photoService, type SavedPhoto } from '../model/photoService';
import { cameraPermissionSignal } from './cameraPermissionSignal';
import { useCameraPermissionViewModel } from './useCameraPermissionViewModel';
import { useCardPhotoViewModel } from './useCardPhotoViewModel';
import { useCardPhotos } from './useCardPhotos';

jest.mock('@/navigation/openRoute', () => ({ openRoute: jest.fn() }));
// Serviço externo atrás da interface (REGRAS.md, regra 1): câmera e galeria de mentira.
jest.mock('../model/photoService', () => ({
  photoService: {
    cameraAccess: jest.fn(),
    requestCameraAccess: jest.fn(),
    takePhoto: jest.fn(),
    pickPhotos: jest.fn(),
    uriOf: (path: string) => `file:///documents/${path}`,
    sizeOf: () => 1_887_437,
    openSettings: jest.fn(),
  },
}));

const repositories = createTestRepositories(db);
const service = jest.mocked(photoService);

const saved = (name: string): SavedPhoto => ({
  path: `attachments/${name}.jpg`,
  thumbnailPath: `attachments/${name}-thumb.jpg`,
});

async function seedCard() {
  const { todo } = await seedBoard(repositories);
  return (await repositories.cards.create({ columnId: todo.id, title: 'Viagem' })).id;
}

const photosOf = (cardId: string) => repositories.attachments.listByCard(cardId);

async function renderPhotos(cardId: string, attachments: Attachment[] = []) {
  const notifyUndoable = jest.fn(() => Promise.resolve());
  const onError = jest.fn();
  const hook = await renderHook(() =>
    useCardPhotos({ cardId, attachments, notifyUndoable, onError }),
  );
  return { ...hook, notifyUndoable, onError };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCardPhotos', () => {
  test('shows each photo with the date, the size and the cover mark', async () => {
    const cardId = await seedCard();
    const photo = await repositories.attachments.add({
      cardId,
      uri: 'attachments/a.jpg',
      thumbnailUri: 'attachments/a-thumb.jpg',
      isCover: true,
    });

    const { result } = await renderPhotos(cardId, [
      { ...photo, createdAt: '2026-05-18T12:00:00Z' },
    ]);

    expect(result.current.items).toEqual([
      {
        id: photo.id,
        thumbnailUri: 'file:///documents/attachments/a-thumb.jpg',
        title: 'Foto de 18 mai',
        detail: 'Foto · 1,8 MB',
        accessibilityLabel: 'Foto de capa. Foto de 18 mai. Toque para ver.',
        isCover: true,
      },
    ]);
  });

  test('attaches the photos from the library as one action, the first one as the cover', async () => {
    const cardId = await seedCard();
    service.pickPhotos.mockResolvedValue([saved('a'), saved('b')]);
    const { result, notifyUndoable } = await renderPhotos(cardId);

    await act(() => result.current.pickPhotos());

    const photos = await photosOf(cardId);
    expect(photos.map((photo) => [photo.uri, photo.isCover])).toEqual([
      ['attachments/a.jpg', true],
      ['attachments/b.jpg', false],
    ]);
    expect(historyStore.nextUndoName()).toBe('Foto Anexada');
    expect(notifyUndoable).toHaveBeenCalledWith('2 fotos anexadas');
  });

  test('does nothing when the library is closed without a choice', async () => {
    const cardId = await seedCard();
    service.pickPhotos.mockResolvedValue(null);
    const { result, notifyUndoable } = await renderPhotos(cardId);

    await act(() => result.current.pickPhotos());

    expect(await photosOf(cardId)).toEqual([]);
    expect(notifyUndoable).not.toHaveBeenCalled();
  });

  test('takes a photo right away when the camera is allowed', async () => {
    const cardId = await seedCard();
    service.cameraAccess.mockResolvedValue('granted');
    service.takePhoto.mockResolvedValue(saved('a'));
    const { result } = await renderPhotos(cardId);

    await act(() => result.current.takePhoto());

    expect(await photosOf(cardId)).toHaveLength(1);
  });

  test('explains the camera first when it was never asked', async () => {
    const cardId = await seedCard();
    service.cameraAccess.mockResolvedValue('undetermined');
    const { result } = await renderPhotos(cardId);

    await act(() => result.current.takePhoto());

    expect(openRoute).toHaveBeenCalledWith({
      pathname: '/card/[cardId]/camera-permission',
      params: { cardId },
    });
    expect(service.takePhoto).not.toHaveBeenCalled();
  });

  test('offers the settings when the camera was denied, keeping the app usable', async () => {
    const cardId = await seedCard();
    service.cameraAccess.mockResolvedValue('denied');
    const { result } = await renderPhotos(cardId);

    await act(() => result.current.takePhoto());
    const title = result.current.cameraDeniedRequest?.title;
    await act(() => result.current.openSettings());

    expect(title).toBe('Câmera desligada para o Pinny');
    expect(service.openSettings).toHaveBeenCalledTimes(1);
    expect(result.current.cameraDeniedRequest).toBeNull();
  });

  test('reports a friendly error when the photo cannot be saved', async () => {
    const cardId = await seedCard();
    service.pickPhotos.mockRejectedValue(new Error('disk full'));
    const { result, onError } = await renderPhotos(cardId);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await act(() => result.current.pickPhotos());

    expect(onError).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test('changes and removes the cover, each with undo', async () => {
    const cardId = await seedCard();
    await repositories.attachments.add({ ...photoInput(cardId, 'a'), isCover: true });
    const second = await repositories.attachments.add(photoInput(cardId, 'b'));
    const { result } = await renderPhotos(cardId);

    await act(() => result.current.setCover(second.id));
    const afterChange = await repositories.attachments.coverIdOf(cardId);
    await act(() => result.current.removeCover());

    expect(afterChange).toBe(second.id);
    expect(await repositories.attachments.coverIdOf(cardId)).toBeNull();
    expect(historyStore.nextUndoName()).toBe('Troca de Capa');
  });

  test('asks before deleting a photo and deletes on confirm', async () => {
    const cardId = await seedCard();
    const photo = await repositories.attachments.add(photoInput(cardId, 'a'));
    const { result, notifyUndoable } = await renderPhotos(cardId);

    await act(async () => result.current.requestDelete(photo.id));
    const title = result.current.deleteRequest?.title;
    await act(() => result.current.confirmDelete());

    expect(title).toBe('Apagar a foto?');
    expect(await photosOf(cardId)).toEqual([]);
    expect(notifyUndoable).toHaveBeenCalledWith('Foto apagada');
  });
});

describe('useCardPhotoViewModel', () => {
  test('shows the photo and closes after deleting it', async () => {
    const cardId = await seedCard();
    const photo = await repositories.attachments.add(photoInput(cardId, 'a'));
    const { result } = await renderHook(() => useCardPhotoViewModel(photo.id));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const uri = result.current.photoUri;
    await act(async () => result.current.requestDelete());
    await act(() => result.current.confirmDelete());

    expect(uri).toBe('file:///documents/attachments/a.jpg');
    expect(await repositories.attachments.getById(photo.id)).toBeNull();
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(snackbarStore.getSnapshot()?.message).toBe('Foto apagada');
  });
});

describe('useCameraPermissionViewModel', () => {
  test('asks the system, tells the card screen the answer and closes', async () => {
    service.requestCameraAccess.mockResolvedValue(true);
    const answers: boolean[] = [];
    const unsubscribe = cameraPermissionSignal.subscribe((isGranted) => answers.push(isGranted));
    const { result } = await renderHook(() => useCameraPermissionViewModel());

    await act(() => result.current.allow());
    unsubscribe();

    expect(answers).toEqual([true]);
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

function photoInput(cardId: string, name: string) {
  return { cardId, uri: `attachments/${name}.jpg`, thumbnailUri: `attachments/${name}-thumb.jpg` };
}
