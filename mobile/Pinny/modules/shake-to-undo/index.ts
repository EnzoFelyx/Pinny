import { requireOptionalNativeModule } from 'expo';

interface ShakeToUndoNativeModule {
  isEnabledAsync(): Promise<boolean>;
}

const nativeModule = requireOptionalNativeModule<ShakeToUndoNativeModule>('ShakeToUndo');

// No iOS, lê a opção "Agitar para Desfazer" do sistema. Onde ela não existe (Android) ou num
// build sem o módulo, considera ligada.
export function isShakeToUndoEnabledAsync(): Promise<boolean> {
  return nativeModule ? nativeModule.isEnabledAsync() : Promise.resolve(true);
}
