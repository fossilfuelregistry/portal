import { FossilFuelType } from "lib/types";
import { GetConstants, useCalculationConstants } from "./calculation-constants/use-calculation-constants";
import { calculateOil } from "./oil";
import { usePrefixConversion } from "./prefix-conversion";

import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { calculateCoal } from "./coal";
import { calculateGas } from "./gas";
import { useCallback } from "react";

type Datapoint = {
  volume: number;
  unit: string;
  fossilFuelType: FossilFuelType;
};

export const useCalculate = () => {
  const prefixConversion = usePrefixConversion();

  const calculate = useCallback(
   (datapoint: Datapoint, calculationConstants:GetConstants ) => {
    const constants = pipe(
      calculationConstants,
      O.getOrElseW(() => null)
    );
    if (!constants) return null;
    if (datapoint.fossilFuelType === "oil") {
      const prefixFactor = prefixConversion(datapoint.unit, "e3bbl");
      if (!prefixFactor) return null;
      return calculateOil({
        prefixFactor,
        constants: constants.oil,
        production: datapoint.volume,
      });
    }
    if (datapoint.fossilFuelType === "coal") {
      const prefixFactor = prefixConversion(datapoint.unit, "e3ton");
      if (!prefixFactor) return null;
      return calculateCoal({
        prefixFactor,
        constants: constants.coal,
        production: datapoint.volume,
      });
    }
    if (datapoint.fossilFuelType === "gas") {
      const prefixFactor = prefixConversion(datapoint.unit, "e9m3");
      if (!prefixFactor) return null;
      return calculateGas({
        prefixFactor,
        constants: constants.gas,
        production: datapoint.volume,
      });
    }
    return null;
  },
  [ prefixConversion])

  return calculate
};
