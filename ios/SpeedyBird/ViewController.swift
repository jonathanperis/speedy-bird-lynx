import UIKit

final class ViewController: UIViewController {
    private var lynxView: LynxView?

    override func viewDidLoad() {
        super.viewDidLoad()
        // Sky color (BG_COLOR) so launch and resize gaps blend into the game.
        view.backgroundColor = UIColor(red: 0, green: 187 / 255, blue: 196 / 255, alpha: 1)

        let config = LynxConfig(provider: BundleTemplateProvider())
        config.register(SpeedyBirdModule.self)
        let lynxView = LynxView { builder in
            builder.config = config
            builder.screenSize = self.view.bounds.size
            builder.fontScale = 1.0
        }
        lynxView.layoutWidthMode = .exact
        lynxView.layoutHeightMode = .exact
        view.addSubview(lynxView)
        self.lynxView = lynxView

        // Losing focus (Home, app switcher, Control Center, a call) pauses the game; only
        // entering the background suspends Lynx, after the pause event has been handled.
        let center = NotificationCenter.default
        center.addObserver(self, selector: #selector(willDeactivate),
                           name: UIScene.willDeactivateNotification, object: nil)
        center.addObserver(self, selector: #selector(didEnterBackground),
                           name: UIScene.didEnterBackgroundNotification, object: nil)
        center.addObserver(self, selector: #selector(willEnterForeground),
                           name: UIScene.willEnterForegroundNotification, object: nil)
        center.addObserver(self, selector: #selector(didActivate),
                           name: UIScene.didActivateNotification, object: nil)

        lynxView.loadTemplate(fromURL: "main.lynx", initData: nil)
    }

    /// The game draws edge to edge and letterboxes itself, so the view follows every size
    /// change (rotation on iPad, Split View, Stage Manager).
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        guard let lynxView, lynxView.frame != view.bounds else { return }
        lynxView.frame = view.bounds
        lynxView.updateViewport(withPreferredLayoutWidth: view.bounds.width,
                                preferredLayoutHeight: view.bounds.height)
    }

    @objc private func willDeactivate() {
        lynxView?.sendGlobalEvent("SpeedyBirdPause", withParams: [])
    }

    @objc private func didEnterBackground() {
        lynxView?.onEnterBackground()
    }

    @objc private func willEnterForeground() {
        lynxView?.onEnterForeground()
    }

    @objc private func didActivate() {
        lynxView?.sendGlobalEvent("SpeedyBirdResume", withParams: [])
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }
    // Taps near the bottom edge flap instead of revealing the home indicator first.
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { .bottom }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        traitCollection.userInterfaceIdiom == .pad ? .all : .portrait
    }
}
