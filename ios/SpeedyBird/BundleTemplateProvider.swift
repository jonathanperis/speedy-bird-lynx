import Foundation

class BundleTemplateProvider: NSObject, LynxTemplateProvider {
    func loadTemplate(withUrl url: String!, onComplete callback: LynxTemplateLoadBlock!) {
        // Bundle file is "main.lynx.bundle" — split into resource "main.lynx" + type "bundle"
        if let filePath = Bundle.main.path(forResource: url, ofType: "bundle") {
            do {
                let data = try Data(contentsOf: URL(fileURLWithPath: filePath))
                callback(data, nil)
            } catch {
                callback(nil, error)
            }
        } else {
            let error = NSError(domain: "com.jonathanperis.speedybird", code: 404,
                                userInfo: [NSLocalizedDescriptionKey: "Bundle not found: \(url ?? "nil")"])
            callback(nil, error)
        }
    }
}
