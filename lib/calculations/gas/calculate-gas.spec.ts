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
          p5: 10360.86400000004,
          p95: 10360.86400000004,
          wa: 10360.86400000004,
        },
        co2: {
          p5: 20841.12000000008,
          p95: 116308.80000000045,
          wa: 42318.560000000165,
        },
        total: {
          p5: 31201.98400000012,
          p95: 126669.6640000005,
          wa: 52679.4240000002,
        },
      },
      scope3: {
        ch4: {
          p5: 0,
          p95: 0,
          wa: 0,
        },
        co2: {
          p5: 211436059.15349388,
          p95: 227011459.4594603,
          wa: 218444989.2911788,
        },
        total: {
          p5: 211436059.15349388,
          p95: 227011459.4594603,
          wa: 218444989.2911788,
        },
      },
      total: {
        ch4: {
          p5: 10360.86400000004,
          p95: 10360.86400000004,
          wa: 10360.86400000004,
        },
        co2: {
          p5: 211456900.2734939,
          p95: 227127768.2594603,
          wa: 218487307.8511788,
        },
        total: {
          p5: 211467261.13749388,
          p95: 227138129.1234603,
          wa: 218497668.7151788,
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
        p5: 31.77,
        wa: 64.51,
        p95: 177.3,
      }),
      methaneFactorisation: isoMethaneFactorisation.wrap(29.8),
      methaneIntensity: isoMethaneIntensity.wrap(0.53),
      petajoulesPerMillionCubicMeterGas:
        isoPetajoulesPerMillionCubicMeterGas.wrap(36),
    };

    const calculation = calculateGas({
      production: 111.507734149244,
      prefixFactor: 1,
      constants,
    });


    expect(calculation).toEqual(expectedResult);
  });
});
