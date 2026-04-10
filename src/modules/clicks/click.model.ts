import type { ClickDevice } from "./click.types";

export interface Click {
  id: number;
  shortUrlId: number;
  clickedAt: Date;
  ipAddress: string;
  country: string | null;
  device: ClickDevice | null;
}
