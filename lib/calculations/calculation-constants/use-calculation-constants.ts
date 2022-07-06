import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import getCalculationConstants, { Filters } from ".";
import { Store } from "../../types";
export const useCalculationConstants = ({ country, projectId, modifier }: Filters) => {
  const calculationConstants = useSelector(
    (redux: Store) => redux.calculationConstants
  );
 
  const constants = useMemo(
    () =>
      pipe(
        calculationConstants,
        O.fromNullable,
        O.map(getCalculationConstants({ country, modifier, projectId })),
      ),
    [calculationConstants]
  );
  return  constants;
};
