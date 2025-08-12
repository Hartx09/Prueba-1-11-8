require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'
install! 'cocoapods', :deterministic_uuids => false

target 'CrystalKingdom' do
  config = use_native_modules!

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    # Hermes is now enabled by default. Disable by setting this flag to false.
    :hermes_enabled => flags[:hermes_enabled],
    :fabric_enabled => flags[:fabric_enabled],
    # Enables Flipper.
    # Note that if you have use_frameworks! enabled, Flipper will not work and you should disable the next line.
    :flipper_configuration => FlipperConfiguration.enabled,
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Pods específicos para Crystal Kingdom
  pod 'BVLinearGradient', :path => '../node_modules/react-native-linear-gradient'
  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
  pod 'RNCAsyncStorage', :path => '../node_modules/@react-native-async-storage/async-storage'
  pod 'react-native-haptic-feedback', :path => '../node_modules/react-native-haptic-feedback'

  target 'CrystalKingdomTests' do
    inherit! :complete
    # Pods for testing
  end

  post_install do |installer|
    react_native_post_install(
      installer,
      # Set `mac_catalyst_enabled` to `true` in order to apply patches
      # necessary for Mac Catalyst builds
      :mac_catalyst_enabled => false
    )
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
  end
end