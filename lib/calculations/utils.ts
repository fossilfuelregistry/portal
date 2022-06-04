
export const add = (a: Scenarios) => (b: Scenarios): Scenarios => ({
    p5: a.p5 + b.p5,
    wa: a.wa + b.wa,
    p95: a.p95 + b.p95,
});

export const multiply = (a: Scenarios) => (b: Scenarios): Scenarios => ({
    p5: a.p5 * b.p5,
    wa: a.wa * b.wa,
    p95: a.p95 * b.p95,
});

export const scalarMultiply = (a: number) => (b: Scenarios): Scenarios => ({
    p5: a * b.p5,
    wa: a * b.wa,
    p95: a * b.p95,
});

export const scalarAddition = (a: number) => (b: Scenarios): Scenarios => ({
    p5: a + b.p5,
    wa: a + b.wa,
    p95: a + b.p95,
});

export type Scenarios = {
    p5: number;
    wa: number;
    p95: number;
};
