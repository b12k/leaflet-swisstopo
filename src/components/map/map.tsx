import React, {
  useState,
  useEffect,
  FunctionComponent,
} from 'react';
import Leaflet from 'leaflet';
import * as swissgrid from 'swissgrid';
import gaussShoelace from 'gauss-shoelace';

import 'leaflet/dist/leaflet.css';

import './map.css';
import pinIcon from './pin.png';
import { Search } from '../search/search';
import { LocationInfo } from './location-info';
import { Location, geoAdminApi } from '../../services';

const DEFAULT_LAT = 46.94636;
const DEFAULT_LNG = 7.44446;
const DEFAULT_ZOOM = 10;
const MAX_ZOOM = 18;

export const Map: FunctionComponent = () => {
  const [map, setMap] = useState<Leaflet.Map>();

  const [layers] = useState({
    pixelMap: Leaflet.tileLayer.wms('https://wms2.geo.admin.ch/?', {
      layers: 'ch.swisstopo.pixelkarte-farbe',
    }),
    cadastralMap: Leaflet.tileLayer.wms('https://wms2.geo.admin.ch/?', {
      layers: 'ch.kantone.cadastralwebmap-farbe',
    }),
    contaminatedAreasMap: Leaflet.tileLayer.wms('https://geodienste.ch/db/kataster_belasteter_standorte_v1_4_0/deu?', {
      layers: 'belastete_standorte_flaechen',
      opacity: 0.35,
    }),
  });

  const [locationInfo, setLocationInfo] = useState<LocationInfo>({})

  useEffect(() => {
    if (map) return;

    const newMap = new Leaflet.Map('map', {
      zoomControl: false,
    });

    setMap(newMap);

    newMap
      .addLayer(layers.pixelMap)
      .setView(Leaflet.latLng(DEFAULT_LAT, DEFAULT_LNG), DEFAULT_ZOOM)
      .locate({ setView: true })
      .on('zoom', () => handleMapZoom(newMap))
      .on('moveend', () => getLocationInfo(newMap));
  });

  const handleMapZoom = (map: Leaflet.Map) => {
    if (map.getZoom() < 16) {
      if (!map.hasLayer(layers.pixelMap)) map.addLayer(layers.pixelMap);
      if (map.hasLayer(layers.cadastralMap)) map.removeLayer(layers.cadastralMap);
      if (map.hasLayer(layers.contaminatedAreasMap)) map.removeLayer(layers.contaminatedAreasMap);
    } else {
      if (!map.hasLayer(layers.cadastralMap)) map.addLayer(layers.cadastralMap);
      if (!map.hasLayer(layers.contaminatedAreasMap)) map.addLayer(layers.contaminatedAreasMap);
      if (map.hasLayer(layers.pixelMap)) map.removeLayer(layers.pixelMap);
    }
  }

  const handleOnFound = (location: Location) => {
    map?.flyTo(Leaflet.latLng(location.attrs.lat, location.attrs.lon), MAX_ZOOM);
  };

  const getLocationInfo = async (map: Leaflet.Map) => {
    const markerCoordinates = map.getCenter();
    const swissGrid = swissgrid.project([markerCoordinates.lng, markerCoordinates.lat]);

    const { data: { results }} = await geoAdminApi.identify(swissGrid);
    const result = results[0];

    if (!result) return;

    const data: LocationInfo = {
      coordinates: {
        lon: markerCoordinates.lng,
        lat: markerCoordinates.lat,
      },
      swissGrid: {
        x: swissGrid[1],
        y: swissGrid[0],
      },
      egrisEgridCode: result.attributes.egris_egrid,
      cadastralNumber: result.attributes.number,
      surface: result.geometry.rings.reduce((acc, next) => {
        return acc + gaussShoelace(next);
      }, 0),
    };
    const tops = result.geometry.rings[0].reduce<{
      xMin: number,
      xMax: number,
      yMin: number,
      yMax: number,
    }>((acc, [yCurr, xCurr]) => {
      if (!acc.xMin || xCurr < acc.xMin) acc.xMin = xCurr;
      if (!acc.xMax || xCurr > acc.xMax) acc.xMax = xCurr;
      if (!acc.yMin || yCurr < acc.yMin) acc.yMin = yCurr;
      if (!acc.yMax || yCurr > acc.yMax) acc.yMax = yCurr;
      return acc;
    }, {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
    });
    const rectangleGeometryPoints: Array<[number, number]> = [
      [tops.yMin, tops.xMin],
      [tops.yMax, tops.xMin],
      [tops.yMax, tops.xMax],
      [tops.yMin, tops.xMax],
    ];
    console.log('Geometry:', rectangleGeometryPoints, await geoAdminApi.getHeights(rectangleGeometryPoints));
    setLocationInfo(data);
  }

  return (
    <>
      <Search
        className="mb-3"
        onFound={handleOnFound}
      />
      <div className="p-1 border position-relative">
        <section id="map" className="border-dark"/>
        <img
          id="pointer"
          alt="pointer"
          src={pinIcon} className="leaflet-marker-pane position-absolute top-50 start-50"
        />
      </div>
      <LocationInfo {...locationInfo} />
    </>
  );
}
