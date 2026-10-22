/**
 * Turns wheel input into steps: one mouse notch is one step, one trackpad swipe (inertia tail included) is one step.
 * A quiet gap of GESTURE_GAP ms starts a new gesture; inside a gesture a fresh, strong notch may step again once
 * STEP_COOLDOWN ms have passed, so a fast spin still advances while a trackpad tail (small deltas) does not.
 */
const GESTURE_GAP = 140;
const STEP_COOLDOWN = 380;
const TRIGGER = 24;
const NOTCH = 60;

export function wheelStepper(onStep: (direction: 1 | -1) => void) {
  let lastEvent = 0;
  let lastStep = 0;
  let acc = 0;
  let done = false;

  return (e: WheelEvent) => {
    e.preventDefault();
    const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const dy = e.deltaMode === 1 ? raw * 32 : e.deltaMode === 2 ? raw * window.innerHeight : raw;
    const now = performance.now();
    if (now - lastEvent > GESTURE_GAP) {
      acc = 0;
      done = false;
    }
    lastEvent = now;
    if (done && now - lastStep > STEP_COOLDOWN && Math.abs(dy) >= NOTCH) {
      acc = 0;
      done = false;
    }
    if (done) return;
    acc += dy;
    if (Math.abs(acc) >= TRIGGER) {
      done = true;
      lastStep = now;
      onStep(acc > 0 ? 1 : -1);
      acc = 0;
    }
  };
}
