# Generate the small host project from checked-in sources; CocoaPods supplies xcodeproj.
require 'xcodeproj'

root = File.expand_path('../ios', __dir__)
project = Xcodeproj::Project.new(File.join(root, 'SpeedyBird.xcodeproj'))
target = project.new_target(:application, 'SpeedyBird', :ios, '15.0')
sources = project.main_group.new_group('SpeedyBird', 'SpeedyBird')
Dir.glob(File.join(root, 'SpeedyBird', '*.swift')).sort.each do |file|
  target.source_build_phase.add_file_reference(sources.new_file(File.basename(file)))
end
resources = sources.new_group('Resources', 'Resources')
target.resources_build_phase.add_file_reference(resources.new_file('main.lynx.bundle'))
audio = resources.new_file('audio')
audio.last_known_file_type = 'folder'
target.resources_build_phase.add_file_reference(audio)
target.build_configurations.each do |config|
  config.build_settings.merge!({
    'PRODUCT_BUNDLE_IDENTIFIER' => 'com.jonathanperis.speedybird',
    'SWIFT_VERSION' => '5.0',
    'SWIFT_OBJC_BRIDGING_HEADER' => 'SpeedyBird/SpeedyBird-Bridging-Header.h',
    'INFOPLIST_FILE' => 'SpeedyBird/Info.plist',
    'TARGETED_DEVICE_FAMILY' => '1,2',
    'CODE_SIGN_STYLE' => 'Automatic',
    'ENABLE_USER_SCRIPT_SANDBOXING' => 'YES',
    'GENERATE_INFOPLIST_FILE' => 'NO',
  })
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(target)
scheme.set_launch_target(target)
scheme.save_as(project.path, 'SpeedyBird', true)
puts 'Generated ios/SpeedyBird.xcodeproj with a shared SpeedyBird scheme.'
