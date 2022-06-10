import {
  FossilFuelType,
  Grades,
  ReservesData,
  Graphs,
  Conversions,
  CO2EScope,
  ScopeKey,
  FuelWithScope,
  CombinedPoint,
} from "lib/types";
import { NextRouter } from "next/router";
import settings from "settings";

const DEBUG = false;

type Range = 0 | 1 | 2;

export type RawDataset = {
  __typename?: string;
  fossilFuelType: FossilFuelType;
  id: number;
  quality: number;
  sourceId: number;
  subtype: string | null;
  unit: string;
  volume: number;
  year: number;
  grade?: any;
};

export type Dataset = {
  fossilFuelType: FossilFuelType;
  id: number;
  quality: number;
  sourceId: number;
  subtype: string | null;
  unit: string;
  volume: number;
  year: number;
  grade?: any;
};

export type NormalizedDataset<Fuel extends FossilFuelType> = {
  __type: "normalized";
  fossilFuelType: Fuel;
  unit: typeof settings.fuelsNormalizedVolumeUnit[Fuel];
};

export function addToTotal(
  total: CO2EScope,
  datapoint: CO2EScope | undefined,
  optionalMultiplicationFactor: number = 1
) {
  if (!total) {
    console.trace();
    console.log({ datapoint });
    return;
    //throw new Error( 'Calculation problem, addToTotal( undefined, ... )' )
  }
  if (!datapoint) return;
  const scopes = Object.keys(datapoint) as ScopeKey[];
  if (!scopes?.length) return;
  const ranges = Object.keys(datapoint[scopes[0]]).map((n) => parseInt(n));

  scopes.forEach((scope) => {
    ranges?.forEach((range) => {
      if (!total[scope]) total[scope] = [0, 0, 0];
      if (!total[scope][range]) total[scope][range] = 0;
      total[scope][range] +=
        datapoint[scope][range] * optionalMultiplicationFactor;
    });
  });
}

function _sumOfFuelCO2(fuel: CO2EScope, range: Range): number {
  try {
    return (fuel.scope1?.[range] ?? 0) + (fuel.scope3?.[range] ?? 0);
  } catch (e) {
    console.info(fuel);
    console.trace();
    throw new Error(
      (e as Error).message + "\nCannot calculate CO2 of " + JSON.stringify(fuel)
    );
  }
}

export function sumOfCO2(
  datapoint: CO2EScope | FuelWithScope | undefined,
  range: Range
): number | undefined {
  if (!datapoint) {
    console.trace();
    return;
  }
  if ("scope1" in datapoint || "scope3" in datapoint)
    return _sumOfFuelCO2(datapoint, range);

  let co2 = 0;
  settings.supportedFuels.forEach((fuel) => {
    if (datapoint[fuel]) co2 += _sumOfFuelCO2(datapoint[fuel], range);
  });
  return co2;
}

export function combineOilAndGasAndCoal(dataset: Dataset[]): CombinedPoint[] {
  let newDataset: object[] = [];
  let nextCombinedPoint = { year: 0 };

  dataset.forEach((d) => {
    if (nextCombinedPoint.year !== d.year) {
      if (nextCombinedPoint.year !== 0) newDataset.push(nextCombinedPoint);
      nextCombinedPoint = { year: d.year };
    }
    // @ts-ignore
    nextCombinedPoint[d.fossilFuelType] = d;
  });
  newDataset.push(nextCombinedPoint);
  return newDataset as CombinedPoint[];
}

export function getPreferredGrades(
  reserves: ReservesData[],
  reservesSourceId: number
): Grades {
  let pGrade = -1,
    cGrade = -1;
  let _pGrade: string, _cGrade: string;

  reserves.forEach((r) => {
    if (r.sourceId !== reservesSourceId) return;
    if (r.grade?.[1] === "p") {
      pGrade = Math.max(
        pGrade,
        settings.gradesPreferenceOrder.indexOf(r.grade?.[0])
      );
    }
    if (r.grade?.[1] === "c") {
      cGrade = Math.max(
        cGrade,
        settings.gradesPreferenceOrder.indexOf(r.grade?.[0])
      );
    }
  });
  DEBUG &&
    console.info("getPreferredGrades", {
      pGrade,
      cGrade,
      reservesSourceId,
      reserves: reserves.filter((r) => r.sourceId === reservesSourceId),
    });
  if (pGrade < 0) _pGrade = "--";
  else _pGrade = settings.gradesPreferenceOrder[pGrade] + "p";
  if (cGrade < 0) _cGrade = "--";
  else _cGrade = settings.gradesPreferenceOrder[cGrade] + "c";

  DEBUG &&
    console.info("getPreferredGrades- after", {
      _pGrade,
      _cGrade,
    });
  return { pGrade: _pGrade, cGrade: _cGrade };
}

// Get pref grade from the aggregated string in the get_reserves_sources backend function
export function getPreferredReserveGrade(grades: string[]): string {
  if (!(grades?.length > 0)) return "";
  let pGrade = -1,
    cGrade = -1;
  let _pGrade = "",
    _cGrade = "";

  grades.forEach((grade) => {
    if (grade?.[1] === "p") {
      pGrade = Math.max(
        pGrade,
        settings.gradesPreferenceOrder.indexOf(grade?.[0])
      );
    }
    if (grade?.[1] === "c") {
      cGrade = Math.max(
        cGrade,
        settings.gradesPreferenceOrder.indexOf(grade?.[0])
      );
    }
  });
  if (pGrade < 0) _pGrade = "--";
  else _pGrade = settings.gradesPreferenceOrder[pGrade] + "p";
  if (cGrade < 0) _cGrade = "--";
  else _cGrade = settings.gradesPreferenceOrder[cGrade] + "c";

  return _pGrade + "/" + _cGrade;
}

export async function co2PageUpdateQuery(
  store: any,
  router: NextRouter,
  parameter?: any,
  value?: any
) {
  const params = [
    "region",
    "productionSourceId",
    "projectionSourceId",
    "reservesSourceId",
    "gwp",
  ];
  const DEBUG = false;
  const query = new URLSearchParams();
  const state = store.getState();

  params.forEach((p) => {
    const v = state[p];
    if (!v) return;
    query.set(p, v);
  });

  // @ts-ignore
  if (state.project === "loading" && router.query.project?.length > 0)
  // @ts-ignore
    query.set("project", router.query.project);
  else if (state.project?.projectIdentifier)
    query.set("project", state.project?.projectIdentifier);

  DEBUG &&
    console.info("URL", parameter, "->", { value, router, query, state });

  if (value !== undefined) query.set(parameter, value);
  else if (typeof parameter == "string") query.delete(parameter);
  else if (typeof parameter == "object") {
    Object.keys(parameter).forEach((p) => {
      if (p === "country") return; // Handled below, goes to path instead of query
      if (parameter[p] === undefined) query.delete(p);
      else query.set(p, parameter[p]);
    });
  }

  let url = "";
  if (router.locale !== router.defaultLocale) url += "/" + router.locale;
  url +=
    router.pathname.replace(/\[country\]/, state.country) +
    "?" +
    query.toString();
  DEBUG && console.info("URL <<<", router.asPath);
  if (url === router.asPath) return;
  DEBUG && console.info("URL >>>", url);

  await router.replace(url, undefined, { shallow: true });
}

type GetFullFuelTypeParams = {
  fossilFuelType: FossilFuelType | null | "";
  subtype: string | null;
};
export function getFullFuelType(datapoint: GetFullFuelTypeParams) {
  let fullFuelType: string | null = datapoint.fossilFuelType;
  // @ts-ignore
  if (datapoint.fossilFuelType?.length > 0)
    // @ts-ignore
    fullFuelType =
      datapoint.fossilFuelType +
      (datapoint.subtype && datapoint.subtype?.length > 0
        ? settings.fuelTypeSeparator + datapoint.subtype?.toLowerCase()
        : "");
  //console.info( 'fullFuelType', fullFuelType )
  return fullFuelType;
}

/**
 * Squash it to have one data point per yer per fuel and per source
 */
export function prepareProductionDataset(dataset: RawDataset[]): Dataset[] {
  const onlySupportedFuelPoints = dataset.filter((datapoint) =>
    settings.supportedFuels.includes(datapoint.fossilFuelType)
  );

  // Now squash multiple year entries into one.
  const singlePointPerYear: RawDataset[] = [];
  let aggregatePoint: RawDataset;

  onlySupportedFuelPoints.forEach((datapoint) => {
    if (!aggregatePoint) {
      aggregatePoint = { ...datapoint };
      return;
    }
    if (
      aggregatePoint.year !== datapoint.year ||
      aggregatePoint.grade?.length > 0 || // Do not aggregate reserves.
      aggregatePoint.fossilFuelType !== datapoint.fossilFuelType ||
      aggregatePoint.sourceId !== datapoint.sourceId
    ) {
      singlePointPerYear.push(aggregatePoint);
      aggregatePoint = { ...datapoint };
      return;
    }

    if (aggregatePoint.unit !== datapoint.unit) {
      console.info({ aggregatePoint, datapoint });
      throw new Error(
        "Multiple data points for same fuel / source / year cannot have different units."
      );
    }

    //console.info( 'Aggregating', { aggregatePoint, datapoint } )
    aggregatePoint.subtype = null;
    aggregatePoint.volume += datapoint.volume;
  });

  // @ts-ignore
  singlePointPerYear.push(aggregatePoint);

  return singlePointPerYear
    .filter((a) => !!a)
    .map((datapoint) => ({ ...datapoint, __typename: undefined }));
}

export const getProductionData = (
  dataset: RawDataset[],
  graphs: Graphs,
  conversions: Conversions
) => {
  if (!(dataset?.length > 0)) return [];

  const singlePointPerYearDataset = prepareProductionDataset(dataset);

  return singlePointPerYearDataset.map((data) => {});
};
