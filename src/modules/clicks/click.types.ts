export const CLICK_DEVICES = ["mobile", "desktop", "tablet", "unknown"] as const;

export type ClickDevice = (typeof CLICK_DEVICES)[number];

export function isClickDevice(value: string): value is ClickDevice {
  return CLICK_DEVICES.includes(value as ClickDevice);
}
