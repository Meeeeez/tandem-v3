import { en } from "./content/en";
import { de } from "./content/de";
import { it } from "./content/it";
import type { Lang } from "./config";

export const content: Record<Lang, typeof en> = {
  en,
  de,
  it,
};
