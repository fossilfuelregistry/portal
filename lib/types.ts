import { Dataset } from "components/CO2Forecast/calculate";
import Graph from "graph-data-structure";
import { GQL_countrySourcesRecord } from "queries/country-types";
import { GQL_projectSourcesRecord } from "queries/general-types";
import settings from "../settings";
import { DatabaseRecord } from "./calculations/calculation-constants/types";
import { PrefixRecord } from "./calculations/prefix-conversion";

export type FossilFuelType = typeof settings.supportedFuels[number];

export type ConvertVolume = {
  volume: number;
  unit: string;
  fossilFuelType: FossilFuelType;
  toUnit: string;
};

export type Graphs = {
  [p in string]: ReturnType<typeof Graph>;
};

export type Source = {
  description: string;
  name: string;
  namePretty: string;
  sourceId: number;
  url: string;
  documentUrl: string | null;
  latestCurationAt: string | null;
};

/** 
 * Scope 1 = production
 * Scope 2 = combustion
 */
export type ScopeKey = "scope1" | "scope3"
type Scenarios = [number, number, number]
export type CO2EScope = {
  [scope in ScopeKey]: Scenarios;
}

export type FuelWithScope = {
  [fuel in FossilFuelType]: CO2EScope
}

export type ProductionData = {
  id: number;
  fossilFuelType: FossilFuelType;
  volume: number;
  year: number;
  unit: string;
  subtype: string | null;
  sourceId: number;
  quality: number;
  co2: CO2EScope;
};

export type ProjectionData = {
  fossilFuelType: FossilFuelType;
  volume: number;
  year: number;
  unit: string;
  subtype: string | null;
  sourceId: number;
  quality: number | null;
  co2: CO2EScope;
};

export type ReservesData = {
  fossilFuelType: FossilFuelType;
  volume: number;
  year: number;
  unit: string;
  subtype: string | null;
  sourceId: number;
  quality: number;
  grade: string;
  co2: CO2EScope
};

export type StableProduction = {
  [k in FossilFuelType]: ProductionData;
};

export type ConversionFactorInStore = {
  id: number;
  authority: string;
  description: null | string;
  fossilFuelType: null | FossilFuelType | "";
  fromUnit: string;
  toUnit: string;
  high: null | number;
  factor: number;
  low: null | number;
  country: null | string;
  modifier: null | string;
  subtype: null | string;
  fullFuelType: null | string;
};

type CO2CostPerTon = {
  source: null;
  year: number | undefined;
  currency: "USD";
  cost: number;
};

export type Store = {
  ip: null | string;
  ipLocation: { lat?: number; lng?: number };
  texts: Record<string, string>;
  allSources: Source[];
  gwp: "GWP100" | string;
  stableProduction: StableProduction | null;
  reservesSourceId: null | number;
  productionSourceId: null | number;
  projectionSourceId: null | number;
  futureEmissionTotals: unknown;
  conversions: ConversionFactorInStore[];
  country: string | null;
  countryName: null | string;
  region: null | string;
  project?: {id: number};
  projectGeo: null;
  availableReserveSources: Array<any>;
  pGrade: null;
  cGrade: null;
  countryTotalCO2: null | number;
  co2CostPerTon: null | CO2CostPerTon;
  co2Costs: CO2CostPerTon[];
  showCostInGraphs: boolean;
  sourcesWithData: ({ [a in FossilFuelType]: boolean } & {
    sourceId: number;
  })[];
  locale: string;
  language: string | null;
  calculationConstants: DatabaseRecord[] | null
  prefixConversions: PrefixRecord[] | null
};

export type Conversion = {
  factor: number;
  low: number | null;
  high: number | null;
  modifier: null | string;
  country: string | null;
};

export type CountryConversionGraphs = {
  conversions: {
    [f in string]: {
      [s in string]: Conversion;
    };
  };
  graphs: Graphs;
};

export type ConversionsList = {
  // string in this case is all possible fuel types
  [p: string]: Conversion;
};

export type Conversions = {
  // string in this case is all possible fuel types
  [p: string]: ConversionsList;
};

export type EmissionFactors = {
  low: number;
  high: number;
  factor: number;
};

export type YearLimit = {
  firstYear: number;
  lastYear: number;
};

export type Limits = {
  projection?: {
    [f in FossilFuelType]: YearLimit;
  };
  reserves?: YearLimit;
  production?: {
    [f in FossilFuelType]: YearLimit;
  };
};

export type Grades = {
  pGrade: string;
  cGrade: string;
};


export type LastReservesType = {
  [fuel in FossilFuelType]: {
    [f in "p" | "c"]: { year: number; value: number };
  };
};


export type CombinedPoint = {"year": number} & {[fuel in FossilFuelType]:Dataset}




export type PrefixConversion = {
  form_unit: string
  to_unit: string
  factor: string
}

export type RawSource = GQL_projectSourcesRecord | GQL_countrySourcesRecord


export type ProjectDataPointRecord = {
  "__typename": "ProjectDataPoint",
  "dataType": "PRODUCTION" | "RESERVE"
  "fossilFuelType": FossilFuelType
  "quality": string | null
  "sourceId": 15
  "subtype": string | null
  "unit": string | null
  "volume": number | null
  "year":  number | null
  "grade": string | null
  "dataYear":  number | null
}

export type ProjectDataRecord = {
    "__typename": "Project"
    "id": number
    "dataYear": number | null
    "description": string | null
    "geoPosition": unknown | null
    "iso3166": string | null
    "iso31662": string
    "linkUrl": string | null
    "locationName": string | null
    "methaneM3Ton": number | null
    "ocOperatorId": string | null
    "operatorName": string | null
    "productionCo2E": number
    "productionMethod": string | null
    "productionType": string | null
    "projectIdentifier": string | null
    "projectType": string | null
    "region": string | null
    "sourceProjectId":  string | null
    "sourceProjectName": string | null
    "projectDataPoints": {
      "__typename": "ProjectDataPointsConnection",
      "nodes": ProjectDataPointRecord[]
    }
}