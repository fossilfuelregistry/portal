import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import getCalculationConstants, { Filters } from ".";
import { Store } from "../../types";
export const useCalculationConstants = () => {
  const calculationConstants = useSelector(
    (redux: Store) => redux.calculationConstants
  );
 
  const getConstants = useCallback(
    ({ country, projectId, modifier }: Filters) =>
      pipe(
        calculationConstants,
        O.fromNullable,
        O.map(getCalculationConstants({ country, modifier, projectId })),
      ),
    [calculationConstants]
  );
  return  getConstants;
};

export type GetConstants = ReturnType<ReturnType<typeof useCalculationConstants>>