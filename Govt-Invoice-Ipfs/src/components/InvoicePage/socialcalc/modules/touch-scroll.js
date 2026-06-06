/**
 * Touch Scroll Module for SocialCalc
 * 
 * Replaces the default "page-jump on swipe" behavior with smooth,
 * continuous scrolling while the finger moves, plus momentum/inertia
 * scrolling on release — similar to native mobile scroll.
 *
 * Horizontal swiping is also supported.
 *
 * Usage:
 *   import { enableTouchScroll, disableTouchScroll } from './touch-scroll.js';
 *   enableTouchScroll();   // call after SocialCalc is initialized
 *   disableTouchScroll();  // call on cleanup / unmount
 */

let SocialCalc;

if (typeof window !== "undefined" && window.SocialCalc) {
    SocialCalc = window.SocialCalc;
} else if (typeof global !== "undefined" && global.SocialCalc) {
    SocialCalc = global.SocialCalc;
} else {
    SocialCalc = {};
}

// ─── Configuration ───────────────────────────────────────────────────────────
const TOUCH_SCROLL_CONFIG = {
    // Pixels the finger must move before we consider it a scroll (vs a tap)
    scrollDeadzone: 8,

    // How many pixels of finger travel equal 1 row / 1 column of scroll
    pixelsPerRow: 36,
    pixelsPerCol: 50,

    // Momentum / inertia
    momentumEnabled: true,
    momentumFriction: 0.92,         // multiplied each frame (lower = more friction)
    momentumMinVelocity: 0.3,       // stop when velocity drops below this (rows/frame)
    momentumFrameInterval: 16,      // ms between momentum frames (~60 fps)

    // Maximum rows/cols to scroll in a single momentum frame
    maxMomentumStep: 4,

    // Velocity sampling: we only look at the last N ms of the gesture
    velocitySampleWindow: 100,      // ms

    // Tap thresholds
    tapMaxDistance: 12,              // max px displacement for a tap
    tapMaxDuration: 300,             // max ms for a tap
    doubleTapMaxGap: 400,           // max ms between two taps
};

// ─── State ───────────────────────────────────────────────────────────────────
let _enabled = false;
let _origProcessTouchStart = null;
let _origProcessTouchMove = null;
let _origProcessTouchEnd = null;
let _origProcessTouchCancel = null;

// Per-gesture state
const _gesture = {
    active: false,
    isScrolling: false,        // did we pass the deadzone?
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,

    // Accumulated fractional row/col debt (sub-row precision)
    rowDebt: 0,
    colDebt: 0,

    // Velocity tracking
    velocitySamples: [],       // { t, dx, dy }

    // Momentum animation
    momentumRAF: null,
    momentumVX: 0,
    momentumVY: 0,

    // Tap detection
    startTime: 0,
    lastTapTime: 0,
    lastTapCoord: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEditor() {
    // Try to find the active editor via SocialCalc's own mechanisms
    if (SocialCalc.GetCurrentWorkBookControl) {
        const ctrl = SocialCalc.GetCurrentWorkBookControl();
        if (ctrl && ctrl.workbook && ctrl.workbook.spreadsheet && ctrl.workbook.spreadsheet.editor) {
            return ctrl.workbook.spreadsheet.editor;
        }
    }
    // Fallback: look in TouchInfo registered elements
    const touchinfo = SocialCalc.TouchInfo;
    if (touchinfo && touchinfo.registeredElements) {
        for (const re of touchinfo.registeredElements) {
            if (re.functionobj && re.functionobj.editor) {
                return re.functionobj.editor;
            }
        }
    }
    return null;
}

function editorCanScroll(editor) {
    if (!editor) return false;
    if (editor.busy) return false;
    if (editor.state !== "start") return false;
    return true;
}

function cancelMomentum() {
    if (_gesture.momentumRAF) {
        cancelAnimationFrame(_gesture.momentumRAF);
        _gesture.momentumRAF = null;
    }
    _gesture.momentumVX = 0;
    _gesture.momentumVY = 0;
}

function addVelocitySample(dx, dy) {
    const now = performance.now();
    _gesture.velocitySamples.push({ t: now, dx, dy });
    // Prune old samples
    const cutoff = now - TOUCH_SCROLL_CONFIG.velocitySampleWindow;
    while (_gesture.velocitySamples.length > 0 && _gesture.velocitySamples[0].t < cutoff) {
        _gesture.velocitySamples.shift();
    }
}

function computeVelocity() {
    const samples = _gesture.velocitySamples;
    if (samples.length < 2) return { vx: 0, vy: 0 };

    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = last.t - first.t;
    if (dt === 0) return { vx: 0, vy: 0 };

    let totalDX = 0;
    let totalDY = 0;
    for (const s of samples) {
        totalDX += s.dx;
        totalDY += s.dy;
    }

    // velocity in pixels per ms → convert to rows/cols per frame
    const pxPerMsX = totalDX / dt;
    const pxPerMsY = totalDY / dt;

    const rowsPerFrame = (pxPerMsY / TOUCH_SCROLL_CONFIG.pixelsPerRow) *
        TOUCH_SCROLL_CONFIG.momentumFrameInterval;
    const colsPerFrame = (pxPerMsX / TOUCH_SCROLL_CONFIG.pixelsPerCol) *
        TOUCH_SCROLL_CONFIG.momentumFrameInterval;

    return { vx: colsPerFrame, vy: rowsPerFrame };
}

function doScroll(editor, rowDelta, colDelta) {
    if (rowDelta === 0 && colDelta === 0) return;
    if (!editorCanScroll(editor)) return;

    // Use the same function SocialCalc uses internally
    if (editor.ScrollRelativeBoth) {
        editor.ScrollRelativeBoth(rowDelta, colDelta);
    } else if (SocialCalc.ScrollRelativeBoth) {
        SocialCalc.ScrollRelativeBoth(editor, rowDelta, colDelta);
    }
}

// ─── Replacement Touch Handlers ──────────────────────────────────────────────

function handleTouchStart(event) {
    // Only handle single-finger touches
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];

    // Cancel any running momentum
    cancelMomentum();

    _gesture.active = true;
    _gesture.isScrolling = false;
    _gesture.startX = touch.pageX;
    _gesture.startY = touch.pageY;
    _gesture.lastX = touch.pageX;
    _gesture.lastY = touch.pageY;
    _gesture.rowDebt = 0;
    _gesture.colDebt = 0;
    _gesture.velocitySamples = [];
    _gesture.startTime = performance.now();

    // Do NOT call preventDefault here — we decide in touchmove whether this
    // is a scroll or a tap. If it's a tap we want the event to flow normally.
}

function handleTouchMove(event) {
    if (!_gesture.active) return;
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    const dx = _gesture.lastX - touch.pageX;   // positive = finger moved left  (scroll right)
    const dy = _gesture.lastY - touch.pageY;   // positive = finger moved up    (scroll down)

    // Check deadzone (only once per gesture)
    if (!_gesture.isScrolling) {
        const totalDX = Math.abs(touch.pageX - _gesture.startX);
        const totalDY = Math.abs(touch.pageY - _gesture.startY);
        if (totalDX < TOUCH_SCROLL_CONFIG.scrollDeadzone &&
            totalDY < TOUCH_SCROLL_CONFIG.scrollDeadzone) {
            return; // still within deadzone — not scrolling yet
        }
        _gesture.isScrolling = true;
    }

    // Prevent native scroll / browser actions once we own the gesture
    event.preventDefault();
    event.stopPropagation();

    // Track velocity (raw pixels)
    addVelocitySample(dx, dy);

    // Accumulate fractional row debt (vertical only)
    _gesture.rowDebt += dy / TOUCH_SCROLL_CONFIG.pixelsPerRow;

    // Scroll integer rows (vertical only)
    const rowStep = Math.trunc(_gesture.rowDebt);

    if (rowStep !== 0) {
        const editor = getEditor();
        if (editor) {
            doScroll(editor, rowStep, 0); // 0 for horizontal = no horizontal scroll
        }
        _gesture.rowDebt -= rowStep;
    }

    _gesture.lastX = touch.pageX;
    _gesture.lastY = touch.pageY;
}

function handleTouchEnd(event) {
    if (!_gesture.active) return;
    _gesture.active = false;

    const elapsed = performance.now() - _gesture.startTime;

    // If we never crossed the deadzone, treat as a tap
    if (!_gesture.isScrolling) {
        handleTap(event, elapsed);
        return;
    }

    // ── Momentum (vertical only) ──
    if (!TOUCH_SCROLL_CONFIG.momentumEnabled) return;

    const { vy } = computeVelocity();
    if (Math.abs(vy) < TOUCH_SCROLL_CONFIG.momentumMinVelocity) {
        return; // too slow for momentum
    }

    _gesture.momentumVY = vy;

    // Fractional accumulator for momentum
    let rowAccum = 0;

    function momentumTick() {
        _gesture.momentumVY *= TOUCH_SCROLL_CONFIG.momentumFriction;

        if (Math.abs(_gesture.momentumVY) < TOUCH_SCROLL_CONFIG.momentumMinVelocity) {
            _gesture.momentumRAF = null;
            return; // done
        }

        rowAccum += _gesture.momentumVY;

        let rowStep = Math.trunc(rowAccum);

        // Clamp to prevent jumping too far in one tick
        const max = TOUCH_SCROLL_CONFIG.maxMomentumStep;
        rowStep = Math.max(-max, Math.min(max, rowStep));

        if (rowStep !== 0) {
            const editor = getEditor();
            if (editor) {
                doScroll(editor, rowStep, 0); // 0 for horizontal = no horizontal scroll
            }
            rowAccum -= rowStep;
        }

        _gesture.momentumRAF = requestAnimationFrame(momentumTick);
    }

    _gesture.momentumRAF = requestAnimationFrame(momentumTick);
}

function handleTouchCancel() {
    cancelMomentum();
    _gesture.active = false;
    _gesture.isScrolling = false;
}

// ─── Tap / Double-Tap Detection ──────────────────────────────────────────────

function handleTap(event, elapsed) {
    const now = performance.now();
    const touchinfo = SocialCalc.TouchInfo;
    const wobj = SocialCalc.FindTouchElement
        ? SocialCalc.FindTouchElement(event)
        : null;

    if (!wobj) return;

    // Check for double-tap
    if (_gesture.lastTapTime &&
        (now - _gesture.lastTapTime) < TOUCH_SCROLL_CONFIG.doubleTapMaxGap) {
        // Double tap → trigger DoubleTap handler
        _gesture.lastTapTime = 0;
        if (wobj.functionobj && wobj.functionobj.DoubleTap) {
            wobj.functionobj.DoubleTap(event, touchinfo, wobj);
        }
        return;
    }

    // Single tap → trigger SingleTap handler (immediately, no delay)
    _gesture.lastTapTime = now;

    // Small delay to allow double-tap detection
    if (_gesture.tapTimeout) clearTimeout(_gesture.tapTimeout);
    _gesture.tapTimeout = setTimeout(() => {
        if (wobj.functionobj && wobj.functionobj.SingleTap) {
            wobj.functionobj.SingleTap(event, touchinfo, wobj);
        }
        _gesture.tapTimeout = null;
    }, TOUCH_SCROLL_CONFIG.doubleTapMaxGap);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Enable smooth touch scrolling on the SocialCalc spreadsheet.
 * Call this AFTER SocialCalc has been fully initialized and the editor is rendered.
 */
export function enableTouchScroll() {
    if (_enabled) return;
    if (!SocialCalc || !SocialCalc.HasTouch) {
        // Not a touch device — nothing to do
        return;
    }

    // Save originals so we can restore later
    _origProcessTouchStart = SocialCalc.ProcessTouchStart;
    _origProcessTouchMove = SocialCalc.ProcessTouchMove;
    _origProcessTouchEnd = SocialCalc.ProcessTouchEnd;
    _origProcessTouchCancel = SocialCalc.ProcessTouchCancel;

    // Replace with our smooth-scroll handlers
    SocialCalc.ProcessTouchStart = handleTouchStart;
    SocialCalc.ProcessTouchMove = handleTouchMove;
    SocialCalc.ProcessTouchEnd = handleTouchEnd;
    SocialCalc.ProcessTouchCancel = handleTouchCancel;

    // Re-register touch listeners on all already-registered elements
    // (the old addEventListener references still point to the OLD functions,
    //  so we must swap them)
    const touchinfo = SocialCalc.TouchInfo;
    if (touchinfo && touchinfo.registeredElements) {
        for (const re of touchinfo.registeredElements) {
            const el = re.element;
            if (!el || !el.removeEventListener) continue;

            // Remove old listeners
            el.removeEventListener("touchstart", _origProcessTouchStart, false);
            el.removeEventListener("touchmove", _origProcessTouchMove, false);
            el.removeEventListener("touchend", _origProcessTouchEnd, false);
            el.removeEventListener("touchcancel", _origProcessTouchCancel, false);

            // Also try removing with { passive: false } capture variants
            el.removeEventListener("touchstart", _origProcessTouchStart, true);
            el.removeEventListener("touchmove", _origProcessTouchMove, true);

            // Add new listeners — touchmove must be non-passive so we can preventDefault
            el.addEventListener("touchstart", handleTouchStart, { passive: true });
            el.addEventListener("touchmove", handleTouchMove, { passive: false });
            el.addEventListener("touchend", handleTouchEnd, { passive: true });
            el.addEventListener("touchcancel", handleTouchCancel, { passive: true });
        }
    }

    _enabled = true;
    console.log("[TouchScroll] Smooth touch scrolling enabled");
}

/**
 * Disable smooth touch scrolling, restoring the original SocialCalc handlers.
 */
export function disableTouchScroll() {
    if (!_enabled) return;

    cancelMomentum();
    if (_gesture.tapTimeout) {
        clearTimeout(_gesture.tapTimeout);
        _gesture.tapTimeout = null;
    }

    // Restore original handlers
    SocialCalc.ProcessTouchStart = _origProcessTouchStart;
    SocialCalc.ProcessTouchMove = _origProcessTouchMove;
    SocialCalc.ProcessTouchEnd = _origProcessTouchEnd;
    SocialCalc.ProcessTouchCancel = _origProcessTouchCancel;

    // Re-register old listeners on elements
    const touchinfo = SocialCalc.TouchInfo;
    if (touchinfo && touchinfo.registeredElements) {
        for (const re of touchinfo.registeredElements) {
            const el = re.element;
            if (!el || !el.removeEventListener) continue;

            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchmove", handleTouchMove);
            el.removeEventListener("touchend", handleTouchEnd);
            el.removeEventListener("touchcancel", handleTouchCancel);

            // Re-add the originals the same way SocialCalc originally added them
            el.addEventListener("touchstart", _origProcessTouchStart, false);
            el.addEventListener("touchmove", _origProcessTouchMove, false);
            el.addEventListener("touchend", _origProcessTouchEnd, false);
            el.addEventListener("touchcancel", _origProcessTouchCancel, false);
        }
    }

    _enabled = false;
    console.log("[TouchScroll] Smooth touch scrolling disabled, originals restored");
}

/**
 * Update touch-scroll configuration at runtime.
 * @param {Partial<typeof TOUCH_SCROLL_CONFIG>} overrides
 */
export function configureTouchScroll(overrides) {
    Object.assign(TOUCH_SCROLL_CONFIG, overrides);
}
