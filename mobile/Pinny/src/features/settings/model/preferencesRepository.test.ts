import { createTestRepositories, type TestRepositories } from '@/test/testRepositories';

let repositories: TestRepositories;

beforeEach(() => {
  repositories = createTestRepositories();
});

describe('preferencesRepository', () => {
  test('a flag that was never saved is off', async () => {
    expect(await repositories.preferences.getFlag('shakeHintSeen')).toBe(false);
  });

  test('saves a flag and reads it back', async () => {
    await repositories.preferences.setFlag('shakeHintSeen', true);

    expect(await repositories.preferences.getFlag('shakeHintSeen')).toBe(true);
  });

  test('overwrites a flag that was already saved', async () => {
    await repositories.preferences.setFlag('shakeHintSeen', true);

    await repositories.preferences.setFlag('shakeHintSeen', false);

    expect(await repositories.preferences.getFlag('shakeHintSeen')).toBe(false);
  });
});
