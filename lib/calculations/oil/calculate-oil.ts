import { pipe } from "fp-ts/function";
import { ap } from "fp-ts/Identity";
import { CalculationConstants } from "../calculation-constants";
import { CO2EEmissions } from "../types";
import { add, generateScenarioFromSingleNumber, scopeAddition } from "../utils";
import { calculateCombustionEmissions, calculateEnergyFromOil, calculateOilCO2EOfMethane, calculateOilCO2EProductionEmissions, calculateOilCO2ProductionEmissions, calculateOilMethaneReleases, calculateTotalOilCO2EEmissions, isoOilCO2ECombustionEmissions, isoOilCO2EOfMethane, isoOilCO2EProductionEmissions, isoOilCO2ProductionEmissions, isoOilProduction, isoTotalOilCO2EEmissions, OilProduction } from "./oil";

type Params = {
    constants: CalculationConstants['oil']
    prefixFactor: number
    production: number
}

export const calculateOil = ({prefixFactor, production, constants}: Params
): CO2EEmissions => {
    const oilProduction: OilProduction = isoOilProduction.wrap(prefixFactor * production)

    const energyFromOil = pipe(
        calculateEnergyFromOil,
        ap(constants.barrelsPerTonne),
        ap(constants.eiaOilNFURatio),
        ap(constants.combustionMassToEnergyFactor),
        ap(oilProduction)
    )

    const combustionEmissions = pipe(
        calculateCombustionEmissions,
        ap(energyFromOil),
        ap(constants.combustionEnergyToEmissionFactors)
    )

    const oilCO2ProductionEmissions = pipe(
        calculateOilCO2ProductionEmissions,
        ap(oilProduction),
        ap(constants.oilProductionCO2Factors),
    )

    const oilMethaneReleases = pipe(
        calculateOilMethaneReleases,
        ap(oilProduction),
        ap(constants.methaneIntensity),
    )

    const oilCO2EOfMethane = pipe(
        calculateOilCO2EOfMethane,
        ap(oilMethaneReleases),
        ap(constants.methaneFactorisation),
    )

    const oilCO2EProductionEmissions = pipe(
        calculateOilCO2EProductionEmissions,
        ap(oilCO2ProductionEmissions),
        ap(oilCO2EOfMethane),
    )

    const totalOilCO2EEmissions = pipe(
        calculateTotalOilCO2EEmissions,
        ap(combustionEmissions),
        ap(oilCO2EProductionEmissions),
    )

    const scope1 = {
        total: isoOilCO2ECombustionEmissions.unwrap(combustionEmissions),
        co2: isoOilCO2ECombustionEmissions.unwrap(combustionEmissions),
        ch4: generateScenarioFromSingleNumber(0),
    }
    const scope3 = {
        co2: isoOilCO2ProductionEmissions.unwrap(oilCO2ProductionEmissions),
        ch4: generateScenarioFromSingleNumber(isoOilCO2EOfMethane.unwrap(oilCO2EOfMethane)),
        total: isoOilCO2EProductionEmissions.unwrap(oilCO2EProductionEmissions),
    }

    return {
        scope1,
        scope3,
        total: pipe(scopeAddition, ap(scope1), ap(scope3))
    }
}