import XCTest

/// Drives the real app on a simulator through the game's accessibility label, which
/// mirrors the game state (see src/game/announcements.ts).
final class SpeedyBirdUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    private func element(labelPrefix prefix: String) -> XCUIElement {
        app.descendants(matching: .any)
            .matching(NSPredicate(format: "label BEGINSWITH %@", prefix))
            .firstMatch
    }

    private func attachScreenshot(named name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    func testTapStartsRunAndCrashEndsIt() {
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Tap to start").waitForExistence(timeout: 15))
        attachScreenshot(named: "ready")

        app.tap()
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Score 0").waitForExistence(timeout: 5))
        attachScreenshot(named: "playing")

        // Without more taps the bird falls to the ground.
        XCTAssertTrue(element(labelPrefix: "Game over. Score 0.").waitForExistence(timeout: 10))
        attachScreenshot(named: "game-over")

        // Restart is locked until the bird has landed; after that a tap returns to Get Ready.
        sleep(1)
        app.tap()
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Tap to start").waitForExistence(timeout: 5))
    }

    /// XCUITest waits for the app to go idle after every tap, and a run animates every frame,
    /// so a test cannot press Home mid-run before the bird lands. Mid-run pausing is covered by
    /// tests/app.test.tsx; here the app must survive backgrounding and still respond.
    func testBackgroundingKeepsTheGameResponsive() {
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Tap to start").waitForExistence(timeout: 15))
        XCUIDevice.shared.press(.home)
        app.activate()
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Tap to start").waitForExistence(timeout: 10))
        app.tap()
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Score 0").waitForExistence(timeout: 10))
        attachScreenshot(named: "after-background")
    }
}
