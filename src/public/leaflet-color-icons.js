'use strict';
const iconsUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';
const blueIcon = new L.Icon({
    iconUrl: `${iconsUrl}/marker-icon-2x-blue.png`,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const redIcon = new L.Icon({
    iconUrl: `${iconsUrl}/marker-icon-2x-red.png`,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const Icons = {
    blueIcon: blueIcon,
    redIcon: redIcon
};
//# sourceMappingURL=leaflet-color-icons.js.map