import { expect, waitFor } from "storybook/test";

/**
 * Assert that an element is actually visible, with a retry.
 *
 * The overlays fade and scale in (`animate-in fade-in-0 zoom-in-95`, from
 * `tw-animate-css`), so there is a window where the node is in the DOM and
 * reachable by role while its computed opacity is still 0 — which is exactly
 * what `toBeVisible` rejects. Racing the animation makes a play function flake;
 * retrying does not, and still fails if the element never becomes visible.
 */
export function expectVisible(element: HTMLElement): Promise<void> {
  return waitFor(() => expect(element).toBeVisible());
}
