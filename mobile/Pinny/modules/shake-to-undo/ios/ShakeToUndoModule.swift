import ExpoModulesCore
import UIKit

// Informa se o "Agitar para Desfazer" (Ajustes > Acessibilidade > Toque) está ligado.
// O Pinny respeita essa escolha: com ela desligada, chacoalhar não desfaz nada.
public class ShakeToUndoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ShakeToUndo")

    AsyncFunction("isEnabledAsync") { () -> Bool in
      UIAccessibility.isShakeToUndoEnabled
    }.runOnQueue(.main)
  }
}
