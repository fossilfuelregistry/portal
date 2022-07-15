import { pipe } from "fp-ts/lib/function";
import { ap, map } from "fp-ts/lib/Identity";
import { CO2EScope } from "lib/types";
import { CO2EEmissions } from "./types";

export const add =
  (a: Scenarios) =>
  (b: Scenarios): Scenarios => ({
    p5: a.p5 + b.p5,
    wa: a.wa + b.wa,
    p95: a.p95 + b.p95,
  });

export const multiply =
  (a: Scenarios) =>
  (b: Scenarios): Scenarios => ({
    p5: a.p5 * b.p5,
    wa: a.wa * b.wa,
    p95: a.p95 * b.p95,
  });

export const scalarMultiply =
  (a: number) =>
  (b: Scenarios): Scenarios => ({
    p5: a * b.p5,
    wa: a * b.wa,
    p95: a * b.p95,
  });

export const scalarAddition =
  (a: number) =>
  (b: Scenarios): Scenarios => ({
    p5: a + b.p5,
    wa: a + b.wa,
    p95: a + b.p95,
  });

export type Scenarios = {
  p5: number;
  wa: number;
  p95: number;
};

export const scopeAddition =
  (scope1: CO2EEmissions["scope1"]) =>
  (scope3: CO2EEmissions["scope3"]): CO2EEmissions["total"] => ({
    ch4: pipe(add, ap(scope1.ch4), ap(scope3.ch4)),
    co2: pipe(add, ap(scope1.co2), ap(scope3.co2)),
    total: pipe(add, ap(scope1.total), ap(scope3.total)),
  });

export const generateScenarioFromSingleNumber = (value: number): Scenarios => ({
  p5: value,
  wa: value,
  p95: value,
});

/**
 * Returns scope1 and scope3 in e6 ton co2e
 */
export const toVintageCO2ERepresentation = (e: CO2EEmissions): CO2EScope => ({
  scope1: [e.scope1.total.p5/1e6, e.scope1.total.wa/1e6, e.scope1.total.p95/1e6],
  scope3: [e.scope3.total.p5/1e6, e.scope3.total.wa/1e6, e.scope3.total.p95/1e6],
});


export const fpLogger = (...data: any[]) => <T>(val: T):T => {
  console.info(data)
  return val
}
