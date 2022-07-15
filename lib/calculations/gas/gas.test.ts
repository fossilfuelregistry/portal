import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import {
  calculateGasCO2ECombustionEmissions,
  calculateGasEnergy,
  calculateGasMethaneReleases,
  isoBarrelsOfOilEquivalent,
  isoEIAGasNFURatioGlobally,
  isoGasCO2ECombustionEmissions,
  isoGasCO2ProductionEmissions,
  isoGasEnergy,
  isoGasIPCCEnergyToEmissionsFactors,
  isoGasProduction,
  isoGasProductionCO2,
  isoGasMethaneReleases,
  isoPetajoulesPerMillionCubicMeterGas,
  isoGasCO2EOfMethane,
  calculateGasCO2EOfMethane,
  isoGasCO2EProductionEmissions,
  calculateGasCO2EProductionEmissions,
  calculateGasCO2ProductionEmissions,
  calculateTotalGasCO2EEmissions,
  isoTotalGasCO2EEmissions,
  isoBOEPere6m3,
  calculateBarrelsOfOilEquivalent,
} from "./gas";
import { isoMethaneFactorisation, isoMethaneIntensity } from "../methane";
import { Scenarios } from "../utils";

describe("GAS", () => {
  describe("Combustion scope3", () => {
    it(" Gas energy", () => {
      const gasProduction = isoGasProduction.wrap(100);
      const petajoulesPerMillionCubicMeterGas =
        isoPetajoulesPerMillionCubicMeterGas.wrap(36);
      const expectedResult = 3600;
      const result = isoGasEnergy.unwrap(
        calculateGasEnergy(gasProduction)(petajoulesPerMillionCubicMeterGas)
      );
      expect(result).toBe(expectedResult);
    });
    it(" Gas CO2E Combustion emissions", () => {
      const gasEnergy = isoGasEnergy.wrap(3600);
      const eiaGasNFURatioGlobally = isoEIAGasNFURatioGlobally.wrap(0.03);
      const gasIPCCEnergyToEmissionsFactors =
        isoGasIPCCEnergyToEmissionsFactors.wrap({
          p5: 54.3,
          wa: 56.1,
          p95: 58.3,
        });
      const expectedResult: Scenarios = {
        p5: 189615600,
        wa: 195901200,
        p95: 203583600,
      };
      const result = isoGasCO2ECombustionEmissions.unwrap(
        calculateGasCO2ECombustionEmissions(gasEnergy)(eiaGasNFURatioGlobally)(
          gasIPCCEnergyToEmissionsFactors
        )
      );
      expect(result.p5).toBe(expectedResult.p5);
      expect(result.wa).toBe(expectedResult.wa);
      expect(result.p95).toBe(expectedResult.p95);
    });
  });

  describe('Production scope1', () => {
    it("Should calculate barrels of oil equivalent",()=>{
      const expectedResult = 588300000;
      const boePere6m3 = isoBOEPere6m3.wrap(5.8830)
      const gasProduction = isoGasProduction.wrap(100);

      const result = pipe(
        calculateBarrelsOfOilEquivalent,
        ap(gasProduction),
        ap(boePere6m3),
        isoBarrelsOfOilEquivalent.unwrap
      )

      expect(result).toEqual(expectedResult)
    })
    it("Gas CO2 Production emissions", () => {
      const barrelsOfOilEquivalent = isoBarrelsOfOilEquivalent.wrap(588300000);
      const gasProductionCO2 = isoGasProductionCO2.wrap({
        p5: 21.1619712238,
        wa: 42.9786330763,
        p95: 118.1175874037,
      });
      const expectedResult: Scenarios = {
        p5: 12449587.6709682000,
        wa: 25284329.8387980000,
        p95: 69488576.6695970000,
      };
      const result = isoGasCO2ProductionEmissions.unwrap(
        calculateGasCO2ProductionEmissions(barrelsOfOilEquivalent)(
          gasProductionCO2
        )
      );
      expect(result.p5.toPrecision(10)).toBe(expectedResult.p5.toPrecision(10));
      expect(result.wa.toPrecision(10)).toBe(expectedResult.wa.toPrecision(10));
      expect(result.p95.toPrecision(10)).toBe(expectedResult.p95.toPrecision(10));
    });
  });
  describe("CH4", () => {
    it(" Methane releases ", () => {
      const barrelsOfOilEquivalent = isoBarrelsOfOilEquivalent.wrap(656000000);
      const methaneIntensity = isoMethaneIntensity.wrap(0.53);
      const expectedResult = 347680;
      const result = isoGasMethaneReleases.unwrap(
        calculateGasMethaneReleases(barrelsOfOilEquivalent)(methaneIntensity)
      );
      expect(result.toFixed(0)).toBe(expectedResult.toString());
    });

    it(" CO2E of methane ", () => {
      const methaneReleases = isoGasMethaneReleases.wrap(344546);
      const methaneFactorisation = isoMethaneFactorisation.wrap(82.5);
      const expectedResult = 28425045;
      const result = isoGasCO2EOfMethane.unwrap(
        calculateGasCO2EOfMethane(methaneReleases)(methaneFactorisation)
      );

      expect(result.toFixed(0)).toBe(expectedResult.toString());
    });
  });
  it(" Upstream Total ", () => {
    const CO2ProductionEmissions = isoGasCO2ProductionEmissions.wrap({
      p5: 14444211,
      wa: 33809913,
      p95: 67968448,
    });
    const CO2EOfMethane = isoGasCO2EOfMethane.wrap(21049410);
    const expectedResult: Scenarios = {
      p5: 35493621,
      wa: 54859323,
      p95: 89017858,
    };
    const result = isoGasCO2EProductionEmissions.unwrap(
      calculateGasCO2EProductionEmissions(CO2ProductionEmissions)(CO2EOfMethane)
    );
    expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
    expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
    expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
  });

  it("Total cas emissions", () => {
    const productionEmissions = isoGasCO2EProductionEmissions.wrap({
      p5: 51514247,
      wa: 70746384,
      p95: 111833019,
    });
    const combustionEmissions = isoGasCO2ECombustionEmissions.wrap({
      p5: 211436059,
      wa: 218444989,
      p95: 227011459,
    });
    const expectedResult = {
      p5: 262950306,
      wa: 289191373,
      p95: 338844478,
    };
    const result = pipe(
      calculateTotalGasCO2EEmissions,
      ap(combustionEmissions),
      ap(productionEmissions),
      isoTotalGasCO2EEmissions.unwrap
    );

    expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
    expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
    expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
  });
});
