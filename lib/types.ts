import Graph from "graph-data-structure"
import settings from "../settings"

export type FossilFuelType = typeof settings.supportedFuels[number]

export type ConvertVolume = {
    volume: number
    unit: string
    fossilFuelType: FossilFuelType
    toUnit: string
}

export type Graphs = {
    [p in string]: ReturnType<typeof Graph>
}

export type Source = {
  description: string
  name: string
  namePretty: string
  sourceId: number
  url: string
  documentUrl: string | null
  latestCurationAt: string | null
};



type StableProductionFuelData<Fuel extends FossilFuelType> = {
    id: number
    fossilFuelType: Fuel
    volume: number
    year: number
    unit: string
    subtype: string | null
    sourceId: number
    quality: number
    co2: {
      scope1: [number, number, number]
      scope3: [number, number, number]
    }
}

export type StableProduction = {
    [k in FossilFuelType]: StableProductionFuelData<k>
  }

export type ConversionFactorInStore = {
    id: number,
    authority: string,
    description: null | string,
    fossilFuelType: null | FossilFuelType | "",
    fromUnit: string,
    toUnit: string,
    high: null | number,
    factor: number,
    low: null | number,
    country: null | string,
    modifier: null | string,
    subtype: null | string,
    fullFuelType:  null | string
}

type CO2CostPerTon = {
  source: null
  year: number | undefined
  currency: "USD"
  cost: number
};

export type Store = {
	ip: null | string
	ipLocation: {lat?: number, lng?: number},
	texts: Record<string, string>,
	allSources: Array<any>,
	gwp: 'GWP100' | string,
	stableProduction: StableProduction | null,
	reservesSourceId: null | number,
	productionSourceId: null | number,
	projectionSourceId: null | number,
	futureEmissionTotals: unknown,
	conversions: ConversionFactorInStore[],
	country: string | null,
	countryName: null | string,
	region: null | string,
	project: unknown,
	projectGeo: null,
	availableReserveSources: Array<any>,
	pGrade: null,
	cGrade: null,
	countryTotalCO2: null | number,
	co2CostPerTon: null | CO2CostPerTon,
	co2Costs: CO2CostPerTon[],
	showCostInGraphs: boolean,
	sourcesWithData: ({[a in FossilFuelType]: boolean} & { sourceId: number})[]
	locale: string
    language: string | null
}


export type Conversion = {
  factor: number
  low: number | null
  high: number | null
  modifier: null | string
  country: string | null
};

export type CountryConversionGraphs = {
	conversions: {
		[f in FossilFuelType]: {
			[s in string]: Conversion
		}
	}
	graphs: Graphs
}

export type InternalConversion = {
	[p in string]: Object
}
