import { isoMethaneFactorisation, isoMethaneIntensity } from "../methane";
import { CO2EEmissions } from "../types";
import { calculateGas } from "./calculate-gas";
import {
  isoBOEPere6m3,
  isoEIAGasNFURatioGlobally,
  isoGasIPCCEnergyToEmissionsFactors,
  isoGasProductionCO2,
  isoPetajoulesPerMillionCubicMeterGas,
} from "./gas";

describe("Calculate gas", () => {
  it("Should calculate gas", () => {
    const expectedResult: CO2EEmissions = {
      scope1: {
        ch4: {
          p5: 10050385.592160024,
          wa: 10050385.592160024,
          p95: 10050385.592160024,
        },
        co2: {
          p5: 12449587.670961538,
          wa: 25284329.83878729,
          p95: 69488576.66959672,
        },
        total: {
          p5: 22499973.26312156,
          wa: 35334715.43094732,
          p95: 79538962.26175675,
        },
      },
      scope3: {
        ch4: {
          p5: 0,
          p95: 0,
          wa: 0,
        },
        co2: {
          p5: 189615600,
          wa: 195901200,
          p95: 203583600,
        },
        total: {
          p5: 189615600,
          wa: 195901200,
          p95: 203583600,
        },
      },
      total: {
        ch4: {
          p5: 10050385.592160024,
          p95: 10050385.592160024,
          wa: 10050385.592160024,
        },
        co2: {
          p5: 202065187.67096153,
          p95: 273072176.66959673,
          wa: 221185529.8387873,
        },
        total: {
          p5: 212115573.26312155,
          p95: 283122562.2617568,
          wa: 231235915.4309473,
        },
      },
    };

    const constants = {
      boePere6m3: isoBOEPere6m3.wrap(5.883),
      eiaGasNFURatioGlobally: isoEIAGasNFURatioGlobally.wrap(0.03),
      gasIPCCEnergyToEmissionsFactors: isoGasIPCCEnergyToEmissionsFactors.wrap({
        p5: 54.3,
        wa: 56.1,
        p95: 58.3,
      }),
      gasProductionCO2: isoGasProductionCO2.wrap({
        p5: 21.1619712238,
        wa: 42.9786330763,
        p95: 118.1175874037,
      }),
      methaneFactorisation: isoMethaneFactorisation.wrap(29.8),
      methaneIntensity: isoMethaneIntensity.wrap(0.5732810836),
      petajoulesPerMillionCubicMeterGas:
        isoPetajoulesPerMillionCubicMeterGas.wrap(36),
    };

    const calculation = calculateGas({
      production: 100,
      prefixFactor: 1,
      constants,
    });

    expect(calculation).toEqual(expectedResult);
  });
});
