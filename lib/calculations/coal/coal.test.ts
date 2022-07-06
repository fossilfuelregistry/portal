import { ap } from "fp-ts/lib/Identity"
import { pipe } from "fp-ts/lib/function"
import { calculateCoalCO2ECombustionEmissions, calculateCoalCO2EProductionEmission, calculateCoalMethaneReleases, calculateTotalCoalCO2EEmissions, isoCoalCO2ECombustionEmissions, isoCoalCO2EProductionEmission, isoCoalMethaneEmissionsMidPoint, isoCoalMethaneReleases, isoCoalProduction, isoTonsCO2EPerTon } from "./coal"
import { Scenarios } from "../utils"
import { isoMethaneFactorisation } from "../methane"

describe("COAL", () => {
  it(" Oil CO2E Combustion emissions", () => {
    const coalProduction = isoCoalProduction.wrap(350000);
    const tonsCO2EPerTon = isoTonsCO2EPerTon.wrap({
      p5: 2.2,
      wa: 2.28,
      p95: 2.36,
    });
    const expectedResult = { p5: 770000000, wa: 798000000, p95: 826000000 };
    const result = isoCoalCO2ECombustionEmissions.unwrap(
      calculateCoalCO2ECombustionEmissions(coalProduction)(tonsCO2EPerTon)
    );
    expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
    expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
    expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
  });

  it("Methane releases", () => {
    const coalProduction = isoCoalProduction.wrap(350000);
    const coalMethaneEmissionsMidPoint =
      isoCoalMethaneEmissionsMidPoint.wrap(3.49);
    const expectedResult = 1221500;
    const result = pipe(
      calculateCoalMethaneReleases,
      ap(coalProduction),
      ap(coalMethaneEmissionsMidPoint),
      isoCoalMethaneReleases.unwrap
    );
    expect(result.toFixed(0)).toBe(expectedResult.toString());
  });

  it(" Coal CO2E Production emissions mid-point ", () => {
    const coalProduction = isoCoalProduction.wrap(350000);
    const coalMethaneEmissionsMidPoint =
      isoCoalMethaneEmissionsMidPoint.wrap(3.49);
    const methaneFactorisation = isoMethaneFactorisation.wrap(82.5);

    const expectedResult = 100773750;
    const result = pipe(
      calculateCoalCO2EProductionEmission,
      ap(coalProduction),
      ap(coalMethaneEmissionsMidPoint),
      ap(methaneFactorisation),
      isoCoalCO2EProductionEmission.unwrap
    );
    expect(result.toFixed(0)).toBe(expectedResult.toString());
  });

  it("Total coal emissions", ()=> {
    const productionEmissions = isoCoalCO2EProductionEmission.wrap(100651631);
    const combustionEmissions = isoCoalCO2ECombustionEmissions.wrap({
      p5: 770369675,
      wa:  798824412,
      p95:  827156957,
    });
    const expectedResult = { p5: 871021306, wa: 899476043, p95: 927808588 };
    const result = isoCoalCO2ECombustionEmissions.unwrap(
        calculateTotalCoalCO2EEmissions(combustionEmissions)(productionEmissions)
    );
    expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
    expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
    expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
  })
});