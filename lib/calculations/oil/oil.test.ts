import { pipe } from "fp-ts/function";
import { ap } from "fp-ts/Identity";
import { isoMethaneFactorisation, isoMethaneIntensity } from "../methane";
import {
  calculateCombustionEmissions,
  calculateEnergyFromOil,
  calculateOilCO2ProductionEmissions,
  isoBarrelsPerTonne,
  isoOilCO2ECombustionEmissions,
  isoCombustionEnergyToEmissionFactors,
  isoCombustionMassToEnergyFactor,
  isoEIAOilNFURatio,
  isoEnergyFromOil,
  isoOilCO2ProductionEmissions,
  isoOilProduction,
  isoOilProductionCO2Factors,
  calculateOilCO2EOfMethane,
  isoOilCO2EOfMethane,
  calculateOilCO2EProductionEmissions,
  isoOilCO2EProductionEmissions,
  calculateOilMethaneReleases,
  isoOilMethaneReleases,
  calculateTotalOilCO2EEmissions,
  isoTotalOilCO2EEmissions,
} from "./oil";
import { Scenarios } from "../utils";

describe("Oil", () => {
  describe("Combustion emissions", () => {
    it("Should calculate the energy from volume", () => {
      const oilProduction = isoOilProduction.wrap(637000);
      const barrelsPerTonne = isoBarrelsPerTonne.wrap(7.33);
      const eiaOilNFURatio = isoEIAOilNFURatio.wrap(0.12);
      const oilMassToEnergyFactor = isoCombustionMassToEnergyFactor.wrap({
        p5: 40.1,
        wa: 42.3,
        p95: 44.8,
      });
      const expectedEnergyOutcome: Scenarios = {
        p5: 3066638,
        wa: 3234882,
        p95: 3426069,
      };
      const result = isoEnergyFromOil.unwrap(
        calculateEnergyFromOil(barrelsPerTonne)(eiaOilNFURatio)(
          oilMassToEnergyFactor
        )(oilProduction)
      );

      expect(result.p5.toFixed(0)).toBe(expectedEnergyOutcome.p5.toString());
      expect(result.wa.toFixed(0)).toBe(expectedEnergyOutcome.wa.toString());
      expect(result.p95.toFixed(0)).toBe(expectedEnergyOutcome.p95.toString());
    });
    it(" 2. Energy -> Emissions ", () => {
      const energyFromOil = isoEnergyFromOil.wrap({
        p5: 3066638,
        wa: 3234882,
        p95: 3426069,
      });
      const energyToEmissionsFactors =
        isoCombustionEnergyToEmissionFactors.wrap({
          p5: 71.1,
          wa: 73.3,
          p95: 75.5,
        });
      const expectedResult: Scenarios = {
        p5: 218037962,
        wa: 237116851,
        p95: 258668210,
      };

      const result = isoOilCO2ECombustionEmissions.unwrap(
        calculateCombustionEmissions(energyFromOil)(energyToEmissionsFactors)
      );

      expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
      expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
      expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
    });
  });
  describe("Production Emissions", () => {
    it(" CO2", () => {
      const oilProduction = isoOilProduction.wrap(637000);
      const oilProductionCO2Factors = isoOilProductionCO2Factors.wrap({
        p5: 22.68,
        wa: 53.08,
        p95: 106.7,
      });
      const expectedResult: Scenarios = {
        p5: 14447160,
        wa: 33811960,
        p95: 67967900,
      };
      const result = isoOilCO2ProductionEmissions.unwrap(
        calculateOilCO2ProductionEmissions(oilProduction)(
          oilProductionCO2Factors
        )
      );

      expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
      expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
      expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
    });
    it("CH4  Methane releases ", () => {
      const oilProduction = isoOilProduction.wrap(637000);
      const methaneIntensity = isoMethaneIntensity.wrap(0.4);
      const expectedResult = 254800;
      const result = isoOilMethaneReleases.unwrap(
        calculateOilMethaneReleases(oilProduction)(methaneIntensity)
      );
      expect(result.toFixed(0)).toBe(expectedResult.toString());
    });
    it("CH4  CO2E of methane ", () => {
      const methaneReleases = isoOilMethaneReleases.wrap(255144);
      const methaneFactorisation = isoMethaneFactorisation.wrap(82.5);
      const expectedResult = 21049380;
      const result = isoOilCO2EOfMethane.unwrap(
        calculateOilCO2EOfMethane(methaneReleases)(methaneFactorisation)
      );

      expect(result.toFixed(0)).toBe(expectedResult.toString());
    });
    it(" Upstream Total CO2E", () => {
      const oilCO2ProductionEmissions = isoOilCO2ProductionEmissions.wrap({
        p5: 14444211,
        wa: 33809913,
        p95: 67968448,
      });
      const oilCO2EOfMethane = isoOilCO2EOfMethane.wrap(21049410);
      const expectedResult: Scenarios = {
        p5: 35493621,
        wa: 54859323,
        p95: 89017858,
      };
      const result = isoOilCO2EProductionEmissions.unwrap(
        calculateOilCO2EProductionEmissions(oilCO2ProductionEmissions)(
          oilCO2EOfMethane
        )
      );
      expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
      expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
      expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
    });
  });

  it("Total oil emissions", () => {
    const productionEmissions = isoOilCO2EProductionEmissions.wrap({
      p5: 35493621,
      wa: 54859323,
      p95: 89017858,
    });
    const combustionEmissions = isoOilCO2ECombustionEmissions.wrap({
      p5: 218037957,
      wa: 237116880,
      p95: 258668232,
    });
    const expectedResult = {
      p5: 253531578,
      wa: 291976203,
      p95: 347686090,
    };
    const result = pipe(
      calculateTotalOilCO2EEmissions,
      ap(combustionEmissions),
      ap(productionEmissions),
      isoTotalOilCO2EEmissions.unwrap
    );

    expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
    expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
    expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
  });
});
