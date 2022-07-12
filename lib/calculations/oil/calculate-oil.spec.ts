import { isoMethaneFactorisation, isoMethaneIntensity } from "../methane";
import { CO2EEmissions } from "../types";
import { calculateOil } from "./calculate-oil";
import {
  isoBarrelsPerTonne,
  isoCombustionEnergyToEmissionFactors,
  isoCombustionMassToEnergyFactor,
  isoEIAOilNFURatio,
  isoOilProductionCO2Factors,
} from "./oil";

describe("Calculate oil", () => {
  it("Should calculate oil", () => {
    const expectedResult: CO2EEmissions = {
      scope1: {
        ch4: {
          p5: 1192000,
          p95: 1192000,
          wa: 1192000,
        },
        co2: {
          p5: 2029000,
          p95: 11213000,
          wa: 5308000,
        },
        total: {
          p5: 3221000,
          p95: 12405000,
          wa: 6500000,
        },
      },
      scope3: {
        ch4: {
          p5: 0,
          p95: 0,
          wa: 0,
        },
        co2: {
          p5: 34228878.58117326,
          p95: 40607257.84447476,
          wa: 37224000,
        },
        total: {
          p5: 34228878.58117326,
          p95: 40607257.84447476,
          wa: 37224000,
        },
      },
      total: {
        ch4: {
          p5: 1192000,
          p95: 1192000,
          wa: 1192000,
        },
        co2: {
          p5: 36257878.58117326,
          p95: 51820257.84447476,
          wa: 42532000,
        },
        total: {
          p5: 37449878.58117326,
          p95: 53012257.84447476,
          wa: 43724000,
        },
      },
    };

    const constants = {
      barrelsPerTonne: isoBarrelsPerTonne.wrap(7.33),
      combustionEnergyToEmissionFactors:
        isoCombustionEnergyToEmissionFactors.wrap({
          p5: 71.1,
          wa: 73.3,
          p95: 75.5,
        }),
      combustionMassToEnergyFactor: isoCombustionMassToEnergyFactor.wrap({
        p5: 40.1,
        wa: 42.3,
        p95: 44.8,
      }),
      eiaOilNFURatio: isoEIAOilNFURatio.wrap(0.12),
      methaneFactorisation: isoMethaneFactorisation.wrap(29.8),
      methaneIntensity: isoMethaneIntensity.wrap(0.4),
      oilProductionCO2Factors: isoOilProductionCO2Factors.wrap({
        p5: 20.29,
        wa: 53.08,
        p95: 112.13,
      }),
    };
    const calculation = calculateOil({
      production: 100000,
      prefixFactor: 1,
      constants,
    });

    expect(calculation).toEqual(expectedResult);
  });
});
