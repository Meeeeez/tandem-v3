export interface LocationCardController {
  show: (index: number) => void;
}

function initCardSlider(card: HTMLElement) {
  const slider = card.querySelector<HTMLElement>(".LocationCard__slider");
  const prevBtn = card.querySelector<HTMLButtonElement>(
    ".LocationCard__controlButton--prev",
  );
  const nextBtn = card.querySelector<HTMLButtonElement>(
    ".LocationCard__controlButton--next",
  );

  if (!slider) return { reset: () => {} };

  const slides = Array.from(
    slider.querySelectorAll<HTMLElement>(".LocationCard__slide"),
  );
  const dots = Array.from(
    card.querySelectorAll<HTMLButtonElement>(".LocationCard__dot"),
  );

  if (slides.length <= 1) {
    return { reset: () => {} };
  }

  let activeIndex = 0;
  let slideObserver: IntersectionObserver | null = null;

  const updateDots = (index: number) => {
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("LocationCard__dot--active", dotIndex === index);
    });
  };

  const scrollToSlide = (index: number) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    activeIndex = clamped;

    slides[clamped]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    updateDots(clamped);
  };

  slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const index = slides.indexOf(entry.target as HTMLElement);
        if (index === -1) return;

        activeIndex = index;
        updateDots(index);
      });
    },
    { root: slider, threshold: 0.6 },
  );

  slides.forEach((slide) => slideObserver?.observe(slide));

  prevBtn?.addEventListener("click", () => scrollToSlide(activeIndex - 1));
  nextBtn?.addEventListener("click", () => scrollToSlide(activeIndex + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const slideIndex = Number(dot.dataset.slideIndex);
      if (!Number.isNaN(slideIndex)) scrollToSlide(slideIndex);
    });
  });

  return {
    reset: () => {
      activeIndex = 0;
      slides[0]?.scrollIntoView({ block: "nearest", inline: "start" });
      updateDots(0);
    },
  };
}

export function initLocationCards(
  cards: HTMLElement[],
  { onClose }: { onClose: () => void },
): LocationCardController {
  const sliders = cards.map((card) => initCardSlider(card));

  cards.forEach((card) => {
    card.querySelector(".LocationCard__close")?.addEventListener("click", onClose);
  });

  return {
    show(index: number) {
      cards.forEach((card, cardIndex) => {
        const isActive = cardIndex === index;
        card.hidden = !isActive;

        if (isActive) {
          sliders[cardIndex]?.reset();
        }
      });
    },
  };
}

export function readLocationCards(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(".LocationCard")).sort(
    (a, b) =>
      Number(a.dataset.locationIndex ?? 0) - Number(b.dataset.locationIndex ?? 0),
  );
}

export function getCardCoordinates(
  card: HTMLElement,
): [number, number] | null {
  const lat = Number(card.dataset.lat);
  const lng = Number(card.dataset.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return [lat, lng];
}
