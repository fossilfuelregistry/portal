import { pipe } from "fp-ts/function";
import { ap } from "fp-ts/Identity";
import { CalculationConstants } from "../calculation-constants";
import { CO2EEmissions } from "../types";
import { generateScenarioFromSingleNumber, scopeAddition } from "../utils";
import {
  calculateGasCO2ECombustionEmissions,
  calculateGasCO2EOfMethane,
  calculateGasCO2EProductionEmissions,
  calculateGasCO2ProductionEmissions,
  calculateGasEnergy,
  calculateGasMethaneReleases,
  calculateTotalGasCO2EEmissions,
  isoGasCO2ECombustionEmissions,
  isoGasCO2EOfMethane,
  isoGasCO2EProductionEmissions,
  isoGasCO2ProductionEmissions,
  isoGasProduction,
} from "./gas";

type Params = {
  constants: CalculationConstants["gas"];
  prefixFactor: number;
  production: number;
};

export const calculateGas = ({
  prefixFactor,
  production,
  constants,
}: Params): CO2EEmissions => {
  const gasProduction = isoGasProduction.wrap(prefixFactor * production);

  const gasEnergy = pipe(
    calculateGasEnergy,
    ap(gasProduction),
    ap(constants.petajoulesPerMillionCubicMeterGas)
  );

  const gasCO2ECombustionEmissions = pipe(
    calculateGasCO2ECombustionEmissions,
    ap(gasEnergy),
    ap(constants.eiaGasNFURatioGlobally),
    ap(constants.gasIPCCEnergyToEmissionsFactors)
  );

  const gasCO2ProductionEmissions = pipe(
    calculateGasCO2ProductionEmissions,
    ap(constants.barrelsOfOilEquivalent),
    ap(constants.gasProductionCO2)
  );

  const gasMethaneReleases = pipe(
    calculateGasMethaneReleases,
    ap(constants.barrelsOfOilEquivalent),
    ap(constants.methaneIntensity)
  );

  const gasCO2EOfMethane = pipe(
    calculateGasCO2EOfMethane,
    ap(gasMethaneReleases),
    ap(constants.methaneFactorisation)
  );

  const gasCO2EProductionEmissions = pipe(
    calculateGasCO2EProductionEmissions,
    ap(gasCO2ProductionEmissions),
    ap(gasCO2EOfMethane)
  );

  const totalGasCO2EEmissions = pipe(
    calculateTotalGasCO2EEmissions,
    ap(gasCO2ECombustionEmissions),
    ap(gasCO2EProductionEmissions)
  );

  const scope1 = {
    co2: isoGasCO2ECombustionEmissions.unwrap(gasCO2ECombustionEmissions),
    ch4: generateScenarioFromSingleNumber(0),
    total: isoGasCO2ECombustionEmissions.unwrap(gasCO2ECombustionEmissions),
  };

  const scope3 = {
    co2: isoGasCO2ProductionEmissions.unwrap(gasCO2ProductionEmissions),
    ch4: generateScenarioFromSingleNumber(
      isoGasCO2EOfMethane.unwrap(gasCO2EOfMethane)
    ),
    total: isoGasCO2EProductionEmissions.unwrap(gasCO2EProductionEmissions),
  };

  return {
    scope1,
    scope3,
    total: pipe(scopeAddition, ap(scope1), ap(scope3)),
  };
};
