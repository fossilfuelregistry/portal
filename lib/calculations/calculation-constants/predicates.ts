import { Predicate } from "fp-ts/Predicate";
import { isNumber } from "fp-ts/lib/number";

import { Constant, DatabaseRecord } from "./types";

export const allScenariosExists: Predicate<DatabaseRecord> = ({
  high,
  low,
  factor,
}: DatabaseRecord) => isNumber(high) && isNumber(low) && isNumber(factor);
export const isBarrelsPerTon: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.BARRELS_PER_TON;
export const isPetaJoulePerMillionCubicMetreGas: Predicate<DatabaseRecord> = (
  a
) => a.constantType === Constant.PETAJOULES_PER_MILLION_CUBIC_METRES_GAS;
export const isBOEPerE6M3: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.BOE_PER_E6M3;
export const isEIANonFuelUseRatio: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.EIA_NON_FUEL_USE_RATIO;
export const isIPCCMassToEnergy: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.IPCC_MASS_TO_ENERGY;
export const isIPCCEnergyToEmission: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.IPCC_ENERGY_TO_EMISSIONS;
export const isProductionCO2Factor: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.PRODUCTION_CO2_FACTOR;
export const isMethaneIntensity: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.METHANE_INTENSITY;
export const isMethaneFactorisation: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.METHANE_FACTORISATION;
export const isCombustionEmissionCO2EFactor: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.COMBUSTION_EMISSIONS_CO2E_FACTOR;
export const isBarrelsOfOilEquivalent: Predicate<DatabaseRecord> = (a) =>
  a.constantType === Constant.BARRELS_OF_OIL_EQUIVALENT;
export const isProject: Predicate<DatabaseRecord> = (a) => Boolean(a.projectId)
