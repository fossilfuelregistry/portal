import { captureException } from "@sentry/nextjs";
import { FossilFuelType } from "lib/types";
import { Scenarios } from "./utils";

export type Meta = {
    country: string
    fuel: FossilFuelType
}

export type New = {
    [f in "scope1" | "scope3" | "total"]: {
        [p in "co2" | "total" | "ch4"]:Scenarios
    }
}

const xxx = ()=> {}

const co2FromVolume = (props: ProductionData, log: any | undefined) => {
    //console.info("co2FromVolume", {props, log})
    if (!props) return { scope1: [0, 0, 0], scope3: [0, 0, 0] };
	// @ts-ignore
    const { volume, unit, fossilFuelType, subtype, methaneM3Ton, country } =
      props;

    let gc = { graphs, conversions };
    if (country) {
      // We want to override graphs to this country instead of the Redux state country
      gc = countryConversionGraphs(country);
      DEBUG &&
        console.info(
          "Country Override:",
          country,
          volume,
          unit,
          fossilFuelType,
          gc
        );
    }

    if (gc.graphs === undefined) {
      _throttled_notification(
        volume,
        unit,
        fossilFuelType,
        subtype,
        methaneM3Ton,
        country
      );
      return { scope1: [0, 0, 0], scope3: [0, 0, 0] };
    }

    const fullFuelType = getFullFuelType({ fossilFuelType, subtype });
    if (!fullFuelType) {
      console.error("No fuel type found", { fossilFuelType, subtype });
      throw new Error("No fuel type found");
    }
    const graph = gc.graphs[fullFuelType as FossilFuelType];
    if (!graph) {
      console.info("No unit conversion graph for " + fullFuelType);
      console.info(graphs);
      // @ts-ignore
      throw new Error(
        "No unit conversion graph for " +
          fullFuelType +
          " in " +
          Object.keys(graphs ?? {})
      );
    }

    let scope1 = {},
      scope3;
    const toScope1Unit = "kgco2e" + settings.fuelTypeSeparator + gwp;

    log && console.info("-----", country, fossilFuelType, volume, unit);
    try {
      log && console.info("--S1--");
      scope1 = _co2Factors(gc, unit, toScope1Unit, fullFuelType, log, volume);
    } catch (e) {
      DEBUG &&
        console.info(
          `Scope 1 ${toScope1Unit} Conversion Error:  ${e.message}`,
          {
            unit,
            toUnit: toScope1Unit,
            fullFuelType,
            graph: graph.serialize(),
          }
        );
        captureException( e )
    }

    try {
      log && console.info("--S3--");
      scope3 = _co2Factors(gc, unit, "kgco2e", fullFuelType, log, volume);
    } catch (e) {
      if (console.trace) console.trace();
      console.info("Conversion to kgco2e Error: " + e.message, {
        unit,
        fullFuelType,
        graph: graph.serialize(),
      });
      captureException( e )
      throw new Error(
        "While looking for " +
          fullFuelType +
          " " +
          unit +
          " -> kgco2e conversion:\n" +
          e.message
      );
    }

    //const DEBUG = fossilFuelType === 'coal' //&& sourceId === 2
    (DEBUG || log) &&
      console.info("CO2", fossilFuelType, volume.toFixed(1), unit, {
        scope1,
        scope3,
        methaneM3Ton,
      });

    let volume1 = volume;
    if (methaneM3Ton > 0) {
      // Calculate Scope1 for sparse project from production volume
      const e6ProductionTons = convertVolume(
        { volume, unit, fossilFuelType },
        "e6ton"
      );
      const e6m3Methane = e6ProductionTons * methaneM3Ton;
      const e3tonMethane = convertVolume(
        {
          volume: e6m3Methane,
          unit: "e6m3",
          fossilFuelType,
        },
        "e3ton|sparse-scope1"
      );
      volume1 = e3tonMethane * 1000000;
      const toUnit = "kgco2e" + settings.fuelTypeSeparator + gwp;
      scope1 = _co2Factors(gc, "ch4kg", toUnit, "coal");
      DEBUG &&
        console.info("Project Specific Scope1:", {
          scope1,
          volume,
          e6ProductionTons,
          e6m3Methane,
          methaneM3Ton,
          e3tonMethane,
          volume1,
          kgco2e: volume1 * scope1.factor,
        });
    }

    const result = {
      scope1: [
        (volume1 * (scope1.low || 0)) / 1e9,
        (volume1 * (scope1.factor || 0)) / 1e9,
        (volume1 * (scope1.high || 0)) / 1e9,
      ],
      scope3: [
        (volume * scope3.low) / 1e9,
        (volume * scope3.factor) / 1e9,
        (volume * scope3.high) / 1e9,
      ],
    };

    if (DEBUG || log) {
      console.info(
        "    ",
        result.scope1[1].toFixed(3),
        "+",
        result.scope3[1].toFixed(3),
        "=",
        (result.scope3[1] + result.scope1[1]).toFixed(3)
      );
      console.info("");
    }
    return result;
  };