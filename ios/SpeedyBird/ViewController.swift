import UIKit

class ViewController: UIViewController {
    private var lynxView: LynxView!

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        let config = LynxConfig(provider: BundleTemplateProvider())
        config.register(SpeedyBirdModule.self)
        lynxView = LynxView { builder in
            builder.config = config
            builder.screenSize = self.view.bounds.size
            builder.fontScale = 1.0
        }
        lynxView.layoutWidthMode = .exact
        lynxView.layoutHeightMode = .exact
        view.addSubview(lynxView)
        NotificationCenter.default.addObserver(self, selector: #selector(pauseGame), name: UIApplication.willResignActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(enterForeground), name: UIApplication.didBecomeActiveNotification, object: nil)
        lynxView.loadTemplate(fromURL: "main.lynx", initData: nil)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let bounds = view.safeAreaLayoutGuide.layoutFrame
        lynxView.frame = bounds
        lynxView.preferredLayoutWidth = bounds.width
        lynxView.preferredLayoutHeight = bounds.height
        lynxView.triggerLayout()
    }

    @objc private func pauseGame() {
        lynxView.sendGlobalEvent("SpeedyBirdPause", withParams: [])
        lynxView.onEnterBackground()
    }

    @objc private func enterForeground() { lynxView.onEnterForeground() }
    deinit { NotificationCenter.default.removeObserver(self) }
    override var prefersStatusBarHidden: Bool { true }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .portrait }
}
