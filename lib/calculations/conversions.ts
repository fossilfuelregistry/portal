import Graph from "graph-data-structure";
import {
  Conversion,
  ConversionFactorInStore,
  Conversions,
  ConvertVolume,
  FossilFuelType,
  Graphs,
  ConversionsList,
} from "lib/types";
import settings from "../../settings";

type GetFullFuelTypeParams = {
  fossilFuelType: FossilFuelType | null | "";
  subtype: string | null;
};

export function getFullFuelType(dataPoint: GetFullFuelTypeParams) {
  let fullFuelType: string | null = dataPoint.fossilFuelType;
  if (dataPoint.fossilFuelType && dataPoint.fossilFuelType?.length > 0)
    fullFuelType =
      dataPoint.fossilFuelType +
      (dataPoint.subtype && dataPoint.subtype?.length > 0
        ? settings.fuelTypeSeparator + dataPoint.subtype.toLowerCase()
        : "");
  return fullFuelType;
}

const _toUnit = (c: ConversionFactorInStore) =>
  c.toUnit +
  (c.modifier && c.modifier?.length > 0
    ? settings.fuelTypeSeparator + c.modifier
    : "");

export const extractAllFuels = (
  conversionConstants: ConversionFactorInStore[]
): string[] =>
  conversionConstants.map(getFullFuelType).reduce(
    (prev, current) => {
      if (!current) return prev;
      return prev.includes(current) ? prev : [...prev, current];
    },
    [...(settings.supportedFuels as unknown as string[])]
  );

export const buildGraphsFromFuels = (fuels: string[], country: string, conversionConstants: ConversionFactorInStore[]) => {
	let _graphs: Graphs = {}
	let _conversions: Conversions = {}

	// Build one Graph() per fuel type
	fuels.forEach( (fuelType: string) => {

		const currentCountry = ( country )
		const { graph, conversions} = buildGraphFromFuel(fuelType, currentCountry, conversionConstants)

		_graphs[ fuelType ] = graph
		_conversions[ fuelType ] = conversions
	 } )

	return { graphs: _graphs, conversions: _conversions }
};

type AllUnitsObjectType = {
  [unit: string]: boolean;
};

type BuildGraphFromFuel = {
  graph: ReturnType<typeof Graph>;
  conversions: ConversionsList;
};
export const buildGraphFromFuel = (
  fuelType: string,
  country: string,
  conversionConstants: ConversionFactorInStore[]
): BuildGraphFromFuel => {
  console.info({ fuelType, country, conversionConstants });
  const graph = Graph();
  const conversions: ConversionsList = {};

  // Build list of constants where we have a country specific override.
  const currentCountry = country;
  const countrySpecificConstants: ConversionFactorInStore[] =
    conversionConstants.filter((c) => c.country === currentCountry);
  const thisFuelConversions = conversionConstants
    .filter((c) => {
      if (c.country === currentCountry) return true;
      if (c.country) return false; // Not current country then!
      // When constant.country is nullish we need to see if there is a country override.
      // In that case skip it.
      let hasOverride = false;
      countrySpecificConstants.forEach((csc) => {
        if (csc.fossilFuelType !== c.fossilFuelType) return;
        if (csc.fromUnit !== c.fromUnit) return;
        if (csc.toUnit !== c.toUnit) return;
        if (csc.subtype !== c.subtype) return;
        if (csc.modifier !== c.modifier) return;
        hasOverride = true; // Everything matches!
      });
      return !hasOverride;
    })
    .filter((c) => c.fullFuelType === fuelType || c.fossilFuelType === null);
  // Add all unique units as nodes
  const allUnits: AllUnitsObjectType = {};
  thisFuelConversions.forEach((u) => {
    allUnits[u.fromUnit] = true;
    allUnits[_toUnit(u)] = true;
  });
  Object.keys(allUnits).forEach((u) => graph.addNode(u));

  thisFuelConversions.forEach((conv) => {
    graph?.addEdge(conv.fromUnit, _toUnit(conv));
    conversions[conv.fromUnit + ">" + _toUnit(conv)] = {
      factor: conv.factor,
      low: conv.low,
      high: conv.high,
      modifier: conv.modifier,
      country: conv.country,
    };
  });
  console.log({ graph, conversions });
  return { graph, conversions };
};

export const convertVolume = (
  { volume, unit, fossilFuelType, toUnit }: ConvertVolume,
  graphs: Graphs,
  conversions: Conversions
): number => {
  try {
    const graph = graphs[fossilFuelType];
    const conversion = conversions[fossilFuelType];

    const path = graph.shortestPath(unit, toUnit);

    let factor = 1;

    for (let step = 1; step < path.length; step++) {
      const from = path[step - 1];
      const to = path[step];
      const conv = conversion[from + ">" + to];

      if (!conv)
        throw new Error(
          `Conversion data issue: From ${from} to ${to} for ${fossilFuelType} is ${JSON.stringify(
            conv
          )}`
        );

      factor *= conv.factor;
    }
    return factor * volume;
  } catch (e) {
    console.info(
      `Conversion problem: ${volume} ${unit} ${fossilFuelType} -> ${toUnit}, ${e.message}`
    );
    return volume;
  }
};
