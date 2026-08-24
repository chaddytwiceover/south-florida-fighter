export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function approach(current: number, target: number, maxDelta: number) {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return target;
}

export function sign(value: number) {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}
