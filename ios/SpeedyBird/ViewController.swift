import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        let lynxView = LynxView { builder in
            builder.config = LynxConfig(provider: BundleTemplateProvider())
            builder.screenSize = self.view.frame.size
            builder.fontScale = 1.0
        }

        lynxView.preferredLayoutWidth = view.frame.size.width
        lynxView.preferredLayoutHeight = view.frame.size.height
        lynxView.layoutWidthMode = .exact
        lynxView.layoutHeightMode = .exact
        view.addSubview(lynxView)

        lynxView.loadTemplate(fromURL: "main.lynx", initData: nil)
    }

    override var prefersStatusBarHidden: Bool { true }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .portrait }
}
