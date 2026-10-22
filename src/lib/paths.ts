/** Pages that own their scrolling (pan, strip, sphere): native + Lenis scroll are off there. */
export const LOCKED_PATHS = ["/", "/bo-suu-tap", "/nhat-ky"];

export function isLockedPath(pathname: string): boolean {
  return LOCKED_PATHS.includes(pathname) || /^\/bo-suu-tap\/[^/]+$/.test(pathname);
}
