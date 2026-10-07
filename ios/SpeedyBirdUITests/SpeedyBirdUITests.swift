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

    func testBackgroundingPausesARun() {
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Tap to start").waitForExistence(timeout: 15))
        app.tap()
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Score 0").waitForExistence(timeout: 5))
        XCUIDevice.shared.press(.home)
        app.activate()
        XCTAssertTrue(element(labelPrefix: "Speedy Bird paused").waitForExistence(timeout: 5))
        attachScreenshot(named: "paused")
        app.tap()
        XCTAssertTrue(element(labelPrefix: "Speedy Bird. Score 0").waitForExistence(timeout: 5))
    }
}
