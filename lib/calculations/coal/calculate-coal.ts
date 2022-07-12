import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import { CalculationConstants } from "../calculation-constants";
import { CO2EEmissions } from "../types";
import { generateScenarioFromSingleNumber, scopeAddition } from "../utils";
import {
  calculateCoalCO2ECombustionEmissions,
  calculateCoalCO2EProductionEmission,
  calculateCoalMethaneReleases,
  isoCoalCO2ECombustionEmissions,
  isoCoalCO2EProductionEmission,
  isoCoalProduction,
} from "./coal";

type Params = {
  constants: CalculationConstants["coal"];
  prefixFactor: number;
  production: number;
};

export const calculateCoal = ({
  prefixFactor,
  production,
  constants,
}: Params): CO2EEmissions => {
  const coalProduction = isoCoalProduction.wrap(prefixFactor * production);

  const coalCO2ECombustionEmissions = pipe(
    calculateCoalCO2ECombustionEmissions,
    ap(coalProduction),
    ap(constants.tonsCO2EPerTon)
  );

  const coalMethaneReleases = pipe(
    calculateCoalMethaneReleases,
    ap(coalProduction),
    ap(constants.coalMethaneEmissionsMidPoint)
  );

  const coalCO2EProductionEmission = pipe(
    calculateCoalCO2EProductionEmission,
    ap(coalMethaneReleases),
    ap(constants.methaneFactorisation)
  );

  const scope3 = {
    total: isoCoalCO2ECombustionEmissions.unwrap(coalCO2ECombustionEmissions),
    co2: isoCoalCO2ECombustionEmissions.unwrap(coalCO2ECombustionEmissions),
    ch4: generateScenarioFromSingleNumber(0),
  };
  const scope1 = {
    total: pipe(
      coalCO2EProductionEmission,
      isoCoalCO2EProductionEmission.unwrap,
      generateScenarioFromSingleNumber
    ),
    co2: generateScenarioFromSingleNumber(0),
    ch4: pipe(
      coalCO2EProductionEmission,
      isoCoalCO2EProductionEmission.unwrap,
      generateScenarioFromSingleNumber
    ),
  };
  return {
    scope1,
    scope3,
    total: pipe(scopeAddition, ap(scope1), ap(scope3)),
  };
};
