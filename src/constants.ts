// Logical playfield. Hosts scale it to fit the screen (see fitViewport).
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 750;

// Fixed simulation step. Physics constants are per step, so gameplay speed does not
// depend on the display refresh rate.
export const STEP_MS = 1000 / 60;
// Longest frame gap simulated after a short stall.
export const MAX_FRAME_MS = 250;
// A frame gap this long during a run means the app was suspended or frozen: pause the run
// instead of resuming it under the player's finger, even if the host's pause event is late.
export const STALL_PAUSE_MS = 500;

// Bird
export const BIRD_X = 80;
export const BIRD_Y_START = 280;
export const BIRD_W = 34;
export const BIRD_H = 24;
export const BIRD_RADIUS = 12;
export const BIRD_FLAP = 7.25;
export const BIRD_GRAVITY = 0.28;

// Bird animation frame intervals (steps)
export const ANIM_GETREADY_INTERVAL = 20;
export const ANIM_PLAY_INTERVAL = 4;

// Bird rotation (degrees). The tilt follows vertical velocity between these limits.
export const ROTATION_UP = -15;
export const ROTATION_NEUTRAL = 0;
export const ROTATION_DOWN = 70;
// Velocity at which the bird is level, and degrees of tilt per unit of velocity.
export const TILT_LEVEL_VELOCITY = 2;
export const TILT_PER_VELOCITY = 7;

// Pipes
export const PIPE_W = 55;
export const PIPE_H = 300;
export const PIPE_GAP = 150;
export const PIPE_DX = 2.7;
export const PIPE_MIN_Y = -200;
export const PIPE_MAX_Y = -80;
export const PIPE_SPAWN_INTERVAL = 77; // steps at base speed
export const PIPE_MIN_SPAWN_INTERVAL = 20;
// Speed grows 1% per point.
export const SPEED_PER_POINT = 0.01;
// Rendered pipe slots. At most three pipes are on screen at any speed.
export const PIPE_POOL_SIZE = 5;

// Background
export const BG_W = 276;
export const BG_H = 228;
export const BG_DX = 0.2;

// Ground — 15% taller to sit higher on screen
export const GROUND_W = 224;
export const GROUND_H = 129;
/** The ground sprite's own height; the band below it is filled with GROUND_COLOR. */
export const GROUND_TILE_H = 112;
export const GROUND_DX = 2.7;

// After game over, taps restart only once the bird has landed and this many steps
// (~0.5 s) have passed, so a frantic final tap cannot skip the results panel.
export const RESTART_DELAY_STEPS = 30;

// Medal thresholds
export const MEDAL_BRONZE = 10;
export const MEDAL_SILVER = 25;
export const MEDAL_GOLD = 50;
export const MEDAL_PLATINUM = 100;

// Colors
export const BG_COLOR = '#00bbc4';
export const LETTERBOX_COLOR = '#04111e';
/** Bottom row of the ground sprite. */
export const GROUND_COLOR = '#ded895';

/** Scale sprites with nearest-neighbor sampling so pixel art stays sharp at any size. */
export const PIXEL_ART = { imageRendering: 'pixelated' } as const;
