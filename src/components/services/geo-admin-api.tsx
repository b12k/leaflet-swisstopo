import axios, { AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api3.geo.admin.ch/rest/services/'
});
type SearchOrigin = 'zipcode' | 'address' | 'parcel';
// interface GeoAdminSearchQuery {}
export type Location = {
  id: number,
  weight: number,
  attrs: {
    label: string,
    lat: number,
    lon: number,
    origin: SearchOrigin,
    x: number,
    y: number,
  };
};

interface GeoAdminSearchResponse {
  results: Location[],
}

// interface GeoAdminIdentifyQuery {}
interface GeoAdminIdentifyResponse {}

export const geoAdminApi = {
  search: (
    searchText: string,
    origins: SearchOrigin[] = ['address', 'zipcode', 'parcel'],
  ) => axiosInstance
    .get<null, AxiosResponse<GeoAdminSearchResponse>>('api/SearchServer', {
      params: {
        searchText,
        type: 'locations',
        origins: origins.join(','),
        limit: 6,
      }
    }),
  identify: (x: number, y: number) => axiosInstance
    .get<null, GeoAdminIdentifyResponse>('all/MapServer/identify', {
      params: {
        geometry: [y + 2000000, x + 1000000].join(','),
        geometryType: 'ersiGeometryPoint',
        layers: 'all:ch.kantone.cadastralwebmap-farbe',
        sr: 2056,
        tolerance: 0,
      },
    }),
}
