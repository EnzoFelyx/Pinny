import { applyUndo } from '@/features/history/model/applyUndo';
import { createTestRepositories, seedBoard, type TestRepositories } from '@/test/testRepositories';

import {
  addAttachment,
  addChecklistItem,
  removeAttachment,
  removeChecklistItem,
  renameChecklistItem,
  setCardCover,
  setChecklistItemDone,
} from './cardEdits';

let repositories: TestRepositories;
let cardId: string;

beforeEach(async () => {
  repositories = createTestRepositories();
  const { todo } = await seedBoard(repositories);
  cardId = (await repositories.cards.create({ columnId: todo.id, title: 'Viagem' })).id;
});

const steps = async () =>
  (await repositories.checklist.listByCard(cardId)).map((item) => [item.text, item.isDone]);
const photoPaths = async () =>
  (await repositories.attachments.listByCard(cardId)).map((photo) => photo.uri);

describe('checklist edits', () => {
  test('adding a step can be undone and redone', async () => {
    const undo = await addChecklistItem(cardId, 'Passagens', repositories.checklist);
    const afterAdd = await steps();
    const redo = await applyUndo(undo, repositories);
    const afterUndo = await steps();
    if (redo) await applyUndo(redo, repositories);

    expect(afterAdd).toEqual([['Passagens', false]]);
    expect(afterUndo).toEqual([]);
    expect(await steps()).toEqual([['Passagens', false]]);
  });

  test('checking a step can be undone', async () => {
    const item = await repositories.checklist.add(cardId, 'Passagens');

    const undo = await setChecklistItemDone(item.id, true, repositories.checklist);
    const afterCheck = await steps();
    if (undo) await applyUndo(undo, repositories);

    expect(afterCheck).toEqual([['Passagens', true]]);
    expect(await steps()).toEqual([['Passagens', false]]);
  });

  test('renaming a step can be undone', async () => {
    const item = await repositories.checklist.add(cardId, 'Hotel');

    const undo = await renameChecklistItem(item.id, 'Pousada', repositories.checklist);
    const afterRename = await steps();
    if (undo) await applyUndo(undo, repositories);

    expect(afterRename).toEqual([['Pousada', false]]);
    expect(await steps()).toEqual([['Hotel', false]]);
  });

  test('removing a step brings it back on undo, in the same place and state', async () => {
    await repositories.checklist.add(cardId, 'Passagens');
    const item = await repositories.checklist.add(cardId, 'Hotel');
    await repositories.checklist.add(cardId, 'Malas');
    await repositories.checklist.setDone(item.id, true);

    const undo = await removeChecklistItem(item.id, repositories.checklist);
    const afterRemove = await steps();
    if (undo) await applyUndo(undo, repositories);

    expect(afterRemove).toEqual([
      ['Passagens', false],
      ['Malas', false],
    ]);
    expect(await steps()).toEqual([
      ['Passagens', false],
      ['Hotel', true],
      ['Malas', false],
    ]);
  });

  test('nothing goes to the history when nothing changes', async () => {
    const item = await repositories.checklist.add(cardId, 'Hotel');

    expect(await setChecklistItemDone(item.id, false, repositories.checklist)).toBeNull();
    expect(await renameChecklistItem(item.id, 'Hotel', repositories.checklist)).toBeNull();
    expect(await removeChecklistItem('missing', repositories.checklist)).toBeNull();
  });
});

describe('photo edits', () => {
  const photo = { uri: 'attachments/a.jpg', thumbnailUri: 'attachments/a-thumb.jpg' };

  test('attaching a photo can be undone and redone', async () => {
    const undo = await addAttachment({ cardId, ...photo }, repositories.attachments);
    const afterAdd = await photoPaths();
    const redo = await applyUndo(undo, repositories);
    const afterUndo = await photoPaths();
    if (redo) await applyUndo(redo, repositories);

    expect(afterAdd).toEqual(['attachments/a.jpg']);
    expect(afterUndo).toEqual([]);
    expect(await photoPaths()).toEqual(['attachments/a.jpg']);
  });

  test('removing a photo brings back the same record on undo', async () => {
    const attachment = await repositories.attachments.add({ cardId, ...photo });

    const undo = await removeAttachment(attachment.id, repositories.attachments);
    const afterRemove = await photoPaths();
    if (undo) await applyUndo(undo, repositories);

    expect(afterRemove).toEqual([]);
    expect(await repositories.attachments.getById(attachment.id)).toEqual(attachment);
  });

  test('removing a photo that is already gone does nothing', async () => {
    expect(await removeAttachment('missing', repositories.attachments)).toBeNull();
  });
});

describe('cover edits', () => {
  const addPhoto = (name: string) =>
    repositories.attachments.add({
      cardId,
      uri: `attachments/${name}.jpg`,
      thumbnailUri: `attachments/${name}-thumb.jpg`,
    });
  const coverId = () => repositories.attachments.coverIdOf(cardId);

  test('changing the cover can be undone and redone', async () => {
    const first = await addPhoto('a');
    const second = await addPhoto('b');
    await repositories.attachments.setCover(cardId, first.id);

    const undo = await setCardCover(cardId, second.id, repositories.attachments);
    const afterChange = await coverId();
    const redo = undo ? await applyUndo(undo, repositories) : null;
    const afterUndo = await coverId();
    if (redo) await applyUndo(redo, repositories);

    expect(afterChange).toBe(second.id);
    expect(afterUndo).toBe(first.id);
    expect(await coverId()).toBe(second.id);
  });

  test('removing the cover can be undone', async () => {
    const photo = await addPhoto('a');
    await repositories.attachments.setCover(cardId, photo.id);

    const undo = await setCardCover(cardId, null, repositories.attachments);
    const afterRemove = await coverId();
    if (undo) await applyUndo(undo, repositories);

    expect(afterRemove).toBeNull();
    expect(await coverId()).toBe(photo.id);
  });

  test('records nothing when the cover does not change', async () => {
    const photo = await addPhoto('a');
    await repositories.attachments.setCover(cardId, photo.id);

    expect(await setCardCover(cardId, photo.id, repositories.attachments)).toBeNull();
  });

  test('undoing the deletion of the cover photo brings the cover back', async () => {
    const photo = await addPhoto('a');
    await repositories.attachments.setCover(cardId, photo.id);

    const undo = await removeAttachment(photo.id, repositories.attachments);
    const afterRemove = await coverId();
    if (undo) await applyUndo(undo, repositories);

    expect(afterRemove).toBeNull();
    expect(await coverId()).toBe(photo.id);
  });

  test('the first photo of the card becomes the cover, the next ones do not', async () => {
    const photo = (name: string) => ({
      cardId,
      uri: `attachments/${name}.jpg`,
      thumbnailUri: `attachments/${name}-thumb.jpg`,
    });
    await addAttachment(photo('a'), repositories.attachments);
    const [first] = await repositories.attachments.listByCard(cardId);
    await addAttachment(photo('b'), repositories.attachments);

    expect(await coverId()).toBe(first.id);
  });

  test('a new photo stays out of the cover when the user removed it', async () => {
    const photo = await addPhoto('a');
    await repositories.attachments.setCover(cardId, null);

    await addAttachment(
      { cardId, uri: 'attachments/b.jpg', thumbnailUri: 'attachments/b-thumb.jpg' },
      repositories.attachments,
    );

    expect(photo.isCover).toBe(false);
    expect(await coverId()).toBeNull();
  });

  test('undoing the first photo takes the cover away, and redoing brings it back', async () => {
    const undo = await addAttachment(
      { cardId, uri: 'attachments/a.jpg', thumbnailUri: 'attachments/a-thumb.jpg' },
      repositories.attachments,
    );
    const cover = await coverId();
    const redo = await applyUndo(undo, repositories);
    const afterUndo = await coverId();
    if (redo) await applyUndo(redo, repositories);

    expect(afterUndo).toBeNull();
    expect(await coverId()).toBe(cover);
  });
});
