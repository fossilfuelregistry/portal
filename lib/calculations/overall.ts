import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import { iso, Newtype } from "newtype-ts";
import { CoalCO2EProductionEmission, isoTotalCoalCO2EEmissions, TotalCoalCO2EEmissions } from "./coal/coal";
import { GasCO2EProductionEmissions, isoTotalGasCO2EEmissions, TotalGasCO2EEmissions } from "./gas/gas";
import { isoOilCO2EProductionEmissions, isoTotalOilCO2EEmissions, OilCO2EProductionEmissions, TotalOilCO2EEmissions } from "./oil/oil";
import { add, Scenarios } from "./utils";

/** Total CO2E Emissions from oil, gas and coal [ ton CO2E ] */
export interface TotalCO2EEmissions extends Newtype<{readonly TotalCO2EEmissions: unique symbol}, Scenarios> {}
export const isoTotalCO2EEmissions = iso<TotalCO2EEmissions>()

export const calculateTotalCO2EEmissions =
  (oil: TotalOilCO2EEmissions) =>
  (gas: TotalGasCO2EEmissions) =>
  (coal: TotalCoalCO2EEmissions): TotalCO2EEmissions =>
    pipe(
      add,
      ap(isoTotalOilCO2EEmissions.unwrap(oil)),
      ap(
        pipe(
          add,
          ap(isoTotalGasCO2EEmissions.unwrap(gas)),
          ap(isoTotalCoalCO2EEmissions.unwrap(coal))
        )
      ),
      isoTotalCO2EEmissions.wrap
    );
