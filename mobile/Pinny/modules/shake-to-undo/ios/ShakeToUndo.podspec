Pod::Spec.new do |s|
  s.name           = 'ShakeToUndo'
  s.version        = '1.0.0'
  s.summary        = 'Lê a opção "Agitar para Desfazer" do iOS.'
  s.description    = 'Módulo local do Pinny: informa se o usuário deixou ligado o desfazer ao chacoalhar nos Ajustes do iPhone.'
  s.author         = 'Enzo Felix'
  s.homepage       = 'https://github.com/EnzoFelyx/Pinny'
  s.license        = { :type => 'Proprietary' }
  s.platforms      = { :ios => '16.4' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.{h,m,swift}'
end
