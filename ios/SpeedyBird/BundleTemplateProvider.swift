import Foundation

/// Loads Lynx bundles packaged in the app bundle, off the main thread.
final class BundleTemplateProvider: NSObject, LynxTemplateProvider {
    func loadTemplate(withUrl url: String!, onComplete callback: LynxTemplateLoadBlock!) {
        DispatchQueue.global(qos: .userInitiated).async {
            // "main.lynx" resolves to the main.lynx.bundle resource.
            guard let path = Bundle.main.path(forResource: url, ofType: "bundle") else {
                callback(nil, NSError(domain: "com.jonathanperis.speedybird", code: 404,
                                      userInfo: [NSLocalizedDescriptionKey: "Bundle not found: \(url ?? "nil")"]))
                return
            }
            do {
                callback(try Data(contentsOf: URL(fileURLWithPath: path)), nil)
            } catch {
                callback(nil, error)
            }
        }
    }
}
