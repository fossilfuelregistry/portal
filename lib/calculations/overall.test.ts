import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import { isoTotalCoalCO2EEmissions } from "./coal/coal";
import { isoTotalGasCO2EEmissions } from "./gas/gas";
import { isoTotalOilCO2EEmissions } from "./oil/oil";
import { calculateTotalCO2EEmissions, isoTotalCO2EEmissions } from "./overall";

describe("Overall calculation", ()=>{
  it("Overall", () => {
    const oil = isoTotalOilCO2EEmissions.wrap({
      p5: 253531577,
      wa: 291976203,
      p95: 347686090,
    });
    const gas = isoTotalGasCO2EEmissions.wrap({
      p5: 262950306,
      wa: 289191373,
      p95: 338844479,
    });
    const coal = isoTotalCoalCO2EEmissions.wrap({
      p5: 871021307,
      wa: 899476044,
      p95: 927808589,
    });
    const expectedResult = {
      p5: 1387503190,
      wa: 1480643620,
      p95: 1614339158,
    };
    const result = pipe(
      calculateTotalCO2EEmissions,
      ap(oil),
      ap(gas),
      ap(coal),
      isoTotalCO2EEmissions.unwrap
    );

    expect(result.p5.toFixed(0)).toBe(expectedResult.p5.toString());
    expect(result.wa.toFixed(0)).toBe(expectedResult.wa.toString());
    expect(result.p95.toFixed(0)).toBe(expectedResult.p95.toString());
  });
})