import React, {FunctionComponent} from 'react';

export interface LocationInfo {
  coordinates?: {
    lon: number,
    lat: number,
  }
  egrisEgridCode?: string,
  cadastralNumber?: number,
  swissGrid?: {
    x: number,
    y: number,
  },
  surface?: number,
}

const NOT_AVAILABLE = 'n/a';

export const LocationInfo: FunctionComponent<LocationInfo & { className?: string }> = ({
  surface,
  className,
  swissGrid,
  coordinates,
  egrisEgridCode,
  cadastralNumber,
}) => (
  <dl className={className}>
    <dt>Coordinates</dt>
    <dd>
      {coordinates ? `${coordinates.lat}, ${coordinates.lon}` : NOT_AVAILABLE}
    </dd>
    <dt>Swiss grid</dt>
    <dd>{swissGrid ? `Y: ${swissGrid.y}, X: ${swissGrid.x}` : NOT_AVAILABLE}</dd>
    <dt>Cadastral number</dt>
    <dd>{cadastralNumber || NOT_AVAILABLE}</dd>
    <dt>EGRIS/EGRID</dt>
    <dd>{egrisEgridCode || NOT_AVAILABLE}</dd>
    <dt>Parcel surface</dt>
    <dd>{surface ? `${surface}m2` : NOT_AVAILABLE}</dd>
  </dl>
);
