# frozen_string_literal: true

# Generates ios/SpeedyBird.xcodeproj from the checked-in sources. Run from ios/ after
# changing the project structure, then reintegrate CocoaPods:
#
#   cd ios && bundle exec ruby ../scripts/generate-ios-project.rb && bundle exec pod install
#
# The app bundles ../dist/main.lynx.bundle and ../assets/audio directly, so the build always
# packages the current `bun run build` output and the canonical sounds; nothing is copied
# into ios/.
require 'fileutils'
require 'xcodeproj'

IOS_DIR = File.expand_path('../ios', __dir__)
PROJECT_PATH = File.join(IOS_DIR, 'SpeedyBird.xcodeproj')
DEPLOYMENT_TARGET = '15.0'

FileUtils.rm_rf(PROJECT_PATH)
project = Xcodeproj::Project.new(PROJECT_PATH)
target = project.new_target(:application, 'SpeedyBird', :ios, DEPLOYMENT_TARGET)

app_group = project.main_group.new_group('SpeedyBird', 'SpeedyBird')
Dir.glob(File.join(IOS_DIR, 'SpeedyBird', '*.swift')).sort.each do |file|
  target.source_build_phase.add_file_reference(app_group.new_file(File.basename(file)))
end
app_group.new_file('SpeedyBird-Bridging-Header.h')
app_group.new_file('Info.plist')
%w[Assets.xcassets PrivacyInfo.xcprivacy].each do |name|
  target.resources_build_phase.add_file_reference(app_group.new_file(name))
end

# Build outputs and canonical assets that live outside ios/.
game_group = project.main_group.new_group('Game', '..')
bundle = game_group.new_file('dist/main.lynx.bundle')
bundle.last_known_file_type = 'file'
target.resources_build_phase.add_file_reference(bundle)
audio = game_group.new_file('assets/audio')
audio.last_known_file_type = 'folder'
target.resources_build_phase.add_file_reference(audio)

target.build_configurations.each do |config|
  config.build_settings.merge!(
    'PRODUCT_BUNDLE_IDENTIFIER' => 'com.jonathanperis.speedybird',
    'PRODUCT_NAME' => '$(TARGET_NAME)',
    'MARKETING_VERSION' => '1.0.0',
    'CURRENT_PROJECT_VERSION' => '1',
    'INFOPLIST_FILE' => 'SpeedyBird/Info.plist',
    'GENERATE_INFOPLIST_FILE' => 'NO',
    'IPHONEOS_DEPLOYMENT_TARGET' => DEPLOYMENT_TARGET,
    'TARGETED_DEVICE_FAMILY' => '1,2',
    'SWIFT_VERSION' => '5.0',
    'SWIFT_OBJC_BRIDGING_HEADER' => 'SpeedyBird/SpeedyBird-Bridging-Header.h',
    'ASSETCATALOG_COMPILER_APPICON_NAME' => 'AppIcon',
    'CODE_SIGN_STYLE' => 'Automatic',
    'ENABLE_USER_SCRIPT_SANDBOXING' => 'YES',
    'LD_RUNPATH_SEARCH_PATHS' => ['$(inherited)', '@executable_path/Frameworks']
  )
end

# UI smoke tests drive the real app on a simulator.
ui_tests = project.new_target(:ui_test_bundle, 'SpeedyBirdUITests', :ios, DEPLOYMENT_TARGET)
ui_group = project.main_group.new_group('SpeedyBirdUITests', 'SpeedyBirdUITests')
Dir.glob(File.join(IOS_DIR, 'SpeedyBirdUITests', '*.swift')).sort.each do |file|
  ui_tests.source_build_phase.add_file_reference(ui_group.new_file(File.basename(file)))
end
ui_tests.add_dependency(target)
ui_tests.build_configurations.each do |config|
  config.build_settings.merge!(
    'PRODUCT_BUNDLE_IDENTIFIER' => 'com.jonathanperis.speedybird.uitests',
    'TEST_TARGET_NAME' => 'SpeedyBird',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'IPHONEOS_DEPLOYMENT_TARGET' => DEPLOYMENT_TARGET,
    'TARGETED_DEVICE_FAMILY' => '1,2',
    'SWIFT_VERSION' => '5.0',
    'CODE_SIGN_STYLE' => 'Automatic'
  )
end

project.save

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(target)
scheme.set_launch_target(target)
scheme.add_test_target(ui_tests)
scheme.save_as(PROJECT_PATH, 'SpeedyBird', true)
puts "Generated #{PROJECT_PATH}; run `bundle exec pod install` next."
