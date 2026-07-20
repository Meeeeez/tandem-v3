import intlTelInput from "intl-tel-input/intlTelInputWithUtils";
import "intl-tel-input/styles";
import type { Iso2, Iti } from "intl-tel-input";
import { de as uiDe, en as uiEn, it as uiIt } from "intl-tel-input/locale";

const INITIAL_COUNTRY_BY_LANG: Record<string, Iso2> = {
  de: "de",
  it: "it",
  en: "de",
};

const UI_TRANSLATIONS = {
  de: uiDe,
  en: uiEn,
  it: uiIt,
} as const;

/** Matches BookingSteps form side padding ($gutter-xl). */
const VIEWPORT_PAD_REM = 2;
const DROPDOWN_GAP = 3;

function viewportPadPx(): number {
  return VIEWPORT_PAD_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

/**
 * ITI anchors detached dropdowns to the tel input. Reposition under the country
 * button and clamp to the viewport so nothing overflows on small screens.
 */
function positionCountryDropdown(input: HTMLInputElement, iti: Iti) {
  const countryBtn = input
    .closest(".iti")
    ?.querySelector<HTMLElement>(".iti__selected-country");
  if (!countryBtn) return;

  const selectorEl = document.getElementById(
    `iti-${iti.id}__country-selector`,
  );
  const detached = selectorEl?.closest<HTMLElement>(
    ".iti--detached-country-selector",
  );
  if (!detached || detached.classList.contains("iti--fullscreen-popup")) {
    return;
  }

  const pad = viewportPadPx();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const btn = countryBtn.getBoundingClientRect();
  const maxWidth = Math.max(0, vw - pad * 2);

  // Disable CSS anchor so our fixed coords win
  detached.style.setProperty("position-anchor", "none");
  input.style.setProperty("anchor-name", "none");
  countryBtn.style.setProperty("anchor-name", "none");

  detached.style.boxSizing = "border-box";
  detached.style.maxWidth = `${maxWidth}px`;
  detached.style.width = "max-content";
  detached.style.right = "auto";
  detached.style.bottom = "auto";

  // Provisional left (align to button), then measure and clamp
  detached.style.left = `${btn.left}px`;
  detached.style.top = `${btn.bottom + DROPDOWN_GAP}px`;

  const rect = detached.getBoundingClientRect();
  const width = Math.min(rect.width || maxWidth, maxWidth);

  let left = btn.left;
  if (left + width > vw - pad) {
    left = vw - pad - width;
  }
  left = Math.max(pad, left);

  const spaceBelow = vh - pad - (btn.bottom + DROPDOWN_GAP);
  const spaceAbove = btn.top - pad - DROPDOWN_GAP;
  const placeBelow = spaceBelow >= Math.min(spaceAbove, 180) || spaceBelow >= spaceAbove;

  let top: number;
  let maxHeight: number;

  if (placeBelow) {
    top = btn.bottom + DROPDOWN_GAP;
    maxHeight = Math.max(120, spaceBelow);
    detached.style.top = `${top}px`;
    detached.style.bottom = "auto";
  } else {
    maxHeight = Math.max(120, spaceAbove);
    const height = Math.min(rect.height || maxHeight, maxHeight);
    top = btn.top - DROPDOWN_GAP - height;
    top = Math.max(pad, top);
    detached.style.top = `${top}px`;
    detached.style.bottom = "auto";
  }

  detached.style.left = `${left}px`;
  detached.style.maxHeight = `${maxHeight}px`;

  const list = detached.querySelector<HTMLElement>(".iti__country-list");
  const search = detached.querySelector<HTMLElement>(".iti__search-input-wrapper");
  const searchH = search?.getBoundingClientRect().height ?? 0;
  if (list) {
    list.style.maxHeight = `${Math.max(80, maxHeight - searchH)}px`;
  }

  const panel = detached.querySelector<HTMLElement>(".iti__country-selector");
  if (panel) {
    panel.style.maxWidth = "100%";
    panel.style.maxHeight = "100%";
  }
}

export function initIntlTelFields(root: ParentNode = document): Iti[] {
  const inputs = root.querySelectorAll<HTMLInputElement>("[data-intl-tel]");

  return Array.from(inputs).map((input) => {
    const existing = intlTelInput.getInstance(input);
    if (existing) return existing;

    const lang = input.dataset.intlTelLang ?? "en";
    const initialCountry =
      (input.dataset.intlTelCountry as Iso2 | undefined) ||
      INITIAL_COUNTRY_BY_LANG[lang] ||
      "de";
    const uiTranslations =
      UI_TRANSLATIONS[lang as keyof typeof UI_TRANSLATIONS] ?? uiEn;

    const iti = intlTelInput(input, {
      initialCountry,
      countryNameLocale: lang,
      uiTranslations,
      separateDialCode: true,
      strictMode: true,
      formatAsYouType: true,
      countrySearch: true,
      containerClass: "FormField__iti",
      dropdownParent: document.body,
      placeholderNumberType: "MOBILE",
    });

    input.addEventListener("open:countryselector", () => {
      requestAnimationFrame(() => positionCountryDropdown(input, iti));
    });

    return iti;
  });
}

export function getIntlTelInstance(input: HTMLInputElement): Iti | null {
  return intlTelInput.getInstance(input);
}
