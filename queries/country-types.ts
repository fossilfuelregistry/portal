import { FossilFuelType } from "lib/types";

type BaseCountryDataRecord = {
  fossilFuelType: FossilFuelType;
  volume: number | null;
  year: number;
  unit: string;
  subtype: string | null;
  sourceId: number;
  quality: number | null;
};

export type GQL_CountryProductionRecord = BaseCountryDataRecord & {
  id: number;
};
export type GQL_CountryReservesRecord = BaseCountryDataRecord & {
  grade: string | null;
};
export type QGL_CountryProjectionRecord = BaseCountryDataRecord;



export type GQL_countryCurrentProductionRecord = {
  id: number;
  fossilFuelType: FossilFuelType;
  sourceId: number;
  unit: string;
  volume: number | null;
  year: number;
  subtype: string | null;
};

export type GQL_countrySourcesRecord = {
dataPoints: null | any 
dataType: string
description: string | null
latestCurationAt: null | string
name: string | null
namePretty: string | null
sourceId: number
year: number | null
records:  null | any
url: string | null
quality: number | undefined
grades: string[] | null
}