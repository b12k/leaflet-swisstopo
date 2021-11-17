import React, {
  useState,
  useEffect,
  FunctionComponent,
} from 'react';
import Leaflet, {LeafletEvent, LeafletMouseEvent} from 'leaflet';

import 'leaflet/dist/leaflet.css';

import './map.css';
import pinIcon from './pin.png';
import { Search } from '../search/search';
import { Location } from '../services';

const DEFAULT_LAT = 46.94636;
const DEFAULT_LNG = 7.44446;
const DEFAULT_ZOOM = 10;
const MAX_ZOOM = 18;

export const Map: FunctionComponent = () => {
  const [map, setMap] = useState<Leaflet.Map>();
  const [layers] = useState({
    pixelMap: Leaflet.tileLayer.wms('https://wms.geo.admin.ch/?', {
      layers: 'ch.swisstopo.pixelkarte-farbe',
    }),
    cadastralMap: Leaflet.tileLayer.wms('https://wms.geo.admin.ch/?', {
      layers: 'ch.kantone.cadastralwebmap-farbe',
    }),
  });

  useEffect(() => {
    if (map) return;
    const newMap = new Leaflet.Map('map', {
      crs: Leaflet.CRS.EPSG3857,
      worldCopyJump: false,
      zoomControl: false,
    });

    setMap(newMap);

    newMap
      .addLayer(layers.pixelMap)
      .setView(Leaflet.latLng(DEFAULT_LAT, DEFAULT_LNG), DEFAULT_ZOOM)
      .locate({ setView: true })
      .on('zoom', () => handleMapZoom(newMap))
      .on('moveend', getLocationInfo);
  });

  const handleMapZoom = (map: Leaflet.Map) => {
    const zoom = map.getZoom();
    if (zoom < 16) {
      if (!map.hasLayer(layers.pixelMap)) map.addLayer(layers.pixelMap);
      if (map.hasLayer(layers.cadastralMap)) map.removeLayer(layers.cadastralMap);
    } else {
      if (!map.hasLayer(layers.cadastralMap)) map.addLayer(layers.cadastralMap);
      if (map.hasLayer(layers.pixelMap)) map.removeLayer(layers.pixelMap);
    }
  }

  const handleOnFound = (location: Location) => {
    map?.flyTo(Leaflet.latLng(location.attrs.lat, location.attrs.lon), MAX_ZOOM);
  };

  const getLocationInfo = (_: LeafletEvent) => {
    console.log('Get info');
  }

  return (
    <>
      <Search
        className="mb-3"
        onFound={handleOnFound}
      />
      <div className="p-1 border position-relative">
        <section id="map" className="border-dark"/>
        <img id="pointer" src={pinIcon} className="leaflet-marker-pane position-absolute top-50 start-50"/>
      </div>
    </>
  );
}
