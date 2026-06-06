import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getCardCoordinates,
  initLocationCards,
  readLocationCards,
} from "../../components/LocationCard/LocationCard.ts";

const MARKER_SIZE = 18;

const MARKER_HTML = "<span></span>";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

function useResponsiveZoomControl(map: L.Map) {
  let zoomControl: L.Control.Zoom | null = null;

  const sync = () => {
    const isDesktop = window.matchMedia(DESKTOP_MEDIA_QUERY).matches;

    if (isDesktop && !zoomControl) {
      zoomControl = L.control.zoom({ position: "topleft" });
      zoomControl.addTo(map);
    } else if (!isDesktop && zoomControl) {
      map.removeControl(zoomControl);
      zoomControl = null;
    }
  };

  sync();
  window.matchMedia(DESKTOP_MEDIA_QUERY).addEventListener("change", sync);
}

export function initLocationMap(root: HTMLElement) {
  const mapElement = root.querySelector<HTMLElement>(".Location__map");
  const popup = root.querySelector<HTMLElement>(".Location__popup");
  const cards = readLocationCards(root);

  if (!mapElement || !popup || cards.length === 0) return;

  const closePopup = () => {
    popup.classList.remove("Location__popup--visible");
    popup.setAttribute("aria-hidden", "true");
    cards.forEach((card) => {
      card.hidden = true;
    });
    activeMarker?.getElement()?.classList.remove("Location__markerIcon--active");
    activeMarker = null;
  };

  const locationCards = initLocationCards(cards, { onClose: closePopup });

  const map = L.map(mapElement, {
    maxBounds: L.latLngBounds([46.38, 11.15], [46.944, 12.225]),
    maxBoundsViscosity: 0.75,
    center: [46.662051, 11.687441],
    zoom: 11,
    minZoom: 11,
    maxZoom: 17,
    scrollWheelZoom: false,
    zoomControl: false,
  });

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  ).addTo(map);

  useResponsiveZoomControl(map);

  const container = map.getContainer();
  container.style.touchAction = "pan-y";

  container.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length >= 2) {
        map.dragging.enable();
        container.style.touchAction = "none";
      } else {
        map.dragging.disable();
        container.style.touchAction = "pan-y";
      }
    },
    { passive: true },
  );

  container.addEventListener(
    "touchend",
    () => {
      map.dragging.disable();
      container.style.touchAction = "pan-y";
    },
    { passive: true },
  );

  const markerIcon = L.divIcon({
    className: "Location__markerIcon",
    html: MARKER_HTML,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
  });

  let activeMarker: L.Marker | null = null;
  const markers: L.Marker[] = [];

  cards.forEach((card, index) => {
    const coordinates = getCardCoordinates(card);
    if (!coordinates) return;

    const marker = L.marker(coordinates, { icon: markerIcon }).addTo(map);

    marker.on("click", () => {
      activeMarker?.getElement()?.classList.remove("Location__markerIcon--active");
      marker.getElement()?.classList.add("Location__markerIcon--active");
      activeMarker = marker;

      locationCards.show(index);
      popup.classList.add("Location__popup--visible");
      popup.setAttribute("aria-hidden", "false");
    });

    markers.push(marker);
  });

  if (markers.length > 0) {
    const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }

  requestAnimationFrame(() => {
    map.invalidateSize();
  });
}
