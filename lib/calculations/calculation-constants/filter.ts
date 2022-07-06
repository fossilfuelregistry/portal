import { filter } from "fp-ts/lib/Array";
import * as Ord from "fp-ts/Ord";
import * as P from "fp-ts/Predicate";
import { isNumber } from "fp-ts/lib/number";
import { DatabaseRecord } from "./types";
import { isProject } from "./predicates";
import { ap } from "fp-ts/lib/Identity";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

const filterBy =
  (property: keyof DatabaseRecord) =>
  (value: string) =>
  (records: DatabaseRecord[]) =>
    pipe(
      records,
      filter((x) => x[property] === value || x[property] === null)
    );

export const filterByConstantType = filterBy("constantType");

export const filterByCountry = (value: string) => (records: DatabaseRecord[]) =>
  pipe(records, filterBy("country")(value), filter(P.not(isProject)));

export const filterByFossilFuelType = filterBy("fossilFuelType");

export const filterByModifier = filterBy("modifier");

export const filterByProjectId = filterBy("projectId");

const applyFilter =
  (
    filterFunction: (
      value: string
    ) => (records: DatabaseRecord[]) => DatabaseRecord[]
  ) =>
  (value: string | null | undefined) =>
  (records: DatabaseRecord[]) =>
    pipe(
      value,
      O.fromNullable,
      O.fold(
        () => records,
        (c) => pipe(filterFunction, ap(c), ap(records))
      )
    );
export const applyCountryFilter = flow(applyFilter(filterByCountry));
export const applyModifierFilter = flow(applyFilter(filterByModifier));
export const applyProjectFilter = flow(applyFilter(filterByProjectId));

const ordNumberOrNull: Ord.Ord<number | null> = Ord.fromCompare((x, y) => {
  if (isNumber(x) && isNumber(y)) return x < y ? -1 : x > y ? 1 : 0;
  if (isNumber(x)) return 1;
  if (isNumber(y)) return -1;
  return 0;
});

export const orderByPriority: Ord.Ord<DatabaseRecord> = Ord.contramap(
  (r: DatabaseRecord) => r.quality
)(ordNumberOrNull);

/*const orderByProjectOrCountry: Ord.Ord<DatabaseRecord> = Ord.fromCompare(
  (a, b) => {
    if (a.projectId) return 1;
  }
);*/
