import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import {
  CoalCO2EProductionEmission,
  isoCoalCO2EProductionEmission,
} from "./coal/coal";
import {
  GasCO2ECombustionEmissions,
  GasCO2EProductionEmissions,
  isoGasCO2ECombustionEmissions,
  isoGasCO2EProductionEmissions,
} from "./gas/gas";
import {
  isoOilCO2ECombustionEmissions,
  isoOilCO2EProductionEmissions,
  OilCO2ECombustionEmissions,
  OilCO2EProductionEmissions,
} from "./oil/oil";
import { add, scalarAddition, Scenarios } from "./utils";

export type CalculateScope1Params = {
  oil: OilCO2EProductionEmissions;
  gas: GasCO2EProductionEmissions;
  coal: CoalCO2EProductionEmission;
};
export const calculateScope1 = ({
  oil,
  gas,
  coal,
}: CalculateScope1Params): Scenarios =>
  pipe(
    add,
    ap(isoOilCO2EProductionEmissions.unwrap(oil)),
    ap(
      pipe(
        scalarAddition,
        ap(isoCoalCO2EProductionEmission.unwrap(coal)),
        ap(isoGasCO2EProductionEmissions.unwrap(gas))
      )
    )
  );

export type CalculateScope3Params = {
  oil: OilCO2ECombustionEmissions;
  gas: GasCO2ECombustionEmissions;
  coal: OilCO2ECombustionEmissions;
};
export const calculateScope3 = ({
  oil,
  gas,
  coal,
}: CalculateScope3Params): Scenarios =>
  pipe(
    add,
    ap(isoOilCO2ECombustionEmissions.unwrap(oil)),
    ap(
      pipe(
        add,
        ap(isoOilCO2ECombustionEmissions.unwrap(coal)),
        ap(isoGasCO2ECombustionEmissions.unwrap(gas))
      )
    )
  );
