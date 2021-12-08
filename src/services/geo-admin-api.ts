import axios, { AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api3.geo.admin.ch/rest/services/'
});

type SearchOrigin = 'zipcode' | 'address' | 'parcel';

type Geometry = Array<[number, number]>;

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

interface GeoAdminIdentifyResponse {
  results: Array<{
    attributes: {
      number: number,
      egris_egrid: string,
    },
    geometry: {
      rings: Array<Geometry>
    }
  }>,
}

function search(
  text: string,
  limit?: number,
  origins?: SearchOrigin[]
): Promise<AxiosResponse<GeoAdminSearchResponse>>;
function search(
  box: number[],
  limit?: number,
  origins?: SearchOrigin[]
): Promise<AxiosResponse<GeoAdminSearchResponse>>;
function search(
  query: number[] | string,
  limit = 10,
  origins: SearchOrigin[] = ['address', 'zipcode', 'parcel']
): Promise<AxiosResponse<GeoAdminSearchResponse>> {
  const params: {
    bbox?: string
    searchText?: string,
    type: string,
    limit: number,
    origins: string,
  } = {
    type: 'locations',
    limit,
    origins: origins.join(',')
  }
  if (typeof query == 'string') {
    params.searchText = query;
  } else {
    const y = query[0] - 2000000;
    const x = query[1] - 1000000;
    params.bbox = [y, x, y, x].join(',');
  }
  return axiosInstance
    .get<null, AxiosResponse<GeoAdminSearchResponse>>(
      'api/SearchServer',
      { params },
    );

}

export const geoAdminApi = {
  search,
  identify: (geometry: number[]) => axiosInstance
    .get<null, AxiosResponse<GeoAdminIdentifyResponse>>('all/MapServer/identify', {
      params: {
        geometry: geometry.join(','),
        geometryType: 'esriGeometryPoint',
        layers: 'all:ch.kantone.cadastralwebmap-farbe',
        sr: 2056,
        tolerance: 0,
      },
    }),
  getHeights: (geometry: Geometry) => axiosInstance.get('profile.json', {
    params: {
      geom: {
        type: 'LineString',
        coordinates: geometry,
      },
      sr: 2056,
      distinct_points: true,
      nb_points: 4,
    }
  }),
}

