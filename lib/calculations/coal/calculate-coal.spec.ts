import { isoMethaneFactorisation } from "../methane";
import { CO2EEmissions } from "../types";
import { calculateCoal } from "./calculate-coal";
import { isoCoalMethaneEmissionsMidPoint, isoTonsCO2EPerTon } from "./coal";

describe("Calculate coal", () => {
  it("Should calculate coal", () => {
    const expectedResult: CO2EEmissions = {
      scope1: {
        total: {
          wa: 36400700,
          p5: 36400700,
          p95: 36400700,
        },
        ch4: {
          wa: 36400700,
          p5: 36400700,
          p95: 36400700,
        },
        co2: {
          p5: 0,
          wa: 0,
          p95: 0,
        },
      },
      scope3: {
        total: {
          p5: 770000000.0000001,
          p95: 826000000,
          wa: 797999999.9999999,
        },
        co2: {
          p5: 770000000.0000001,
          p95: 826000000,
          wa: 797999999.9999999,
        },
        ch4: {
          p5: 0,
          wa: 0,
          p95: 0,
        },
      },
      total: {
        total: {
          p5: 806400700.0000001,
          wa: 834400699.9999999,
          p95: 862400700,
        },
        ch4: {
          p5: 36400700,
          p95: 36400700,
          wa: 36400700,
        },
        co2: {
          p5: 770000000.0000001,
          p95: 826000000,
          wa: 797999999.9999999,
        },
      },
    };

    const constants = {
      coalMethaneEmissionsMidPoint: isoCoalMethaneEmissionsMidPoint.wrap(3.49),
      methaneFactorisation: isoMethaneFactorisation.wrap(29.8),
      tonsCO2EPerTon: isoTonsCO2EPerTon.wrap({
        p5: 2.2,
        wa: 2.28,
        p95: 2.36,
      }),
    };

    const calculation = calculateCoal({
      production: 350000,
      prefixFactor: 1,
      constants,
    });

    expect(calculation).toEqual(expectedResult);
  });
});
