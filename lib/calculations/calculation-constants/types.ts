import { TonsCO2EPerTon, CoalMethaneEmissionsMidPoint } from "../coal/coal";
import {
  BarrelsOfOilEquivalent,
  BOEPere6m3,
  EIAGasNFURatioGlobally,
  GasIPCCEnergyToEmissionsFactors,
  GasProductionCO2,
  PetajoulesPerMillionCubicMeterGas,
} from "../gas/gas";
import { MethaneFactorisation, MethaneIntensity } from "../methane";
import {
  BarrelsPerTonne,
  EIAOilNFURatio,
  CombustionMassToEnergyFactor,
  CombustionEnergyToEmissionFactors,
  OilProductionCO2Factors,
} from "../oil/oil";

export type Constants = {
  oil: {
    barrelsPerTonne: BarrelsPerTonne;
    eiaOilNFURatio: EIAOilNFURatio;
    combustionMassToEnergyFactor: CombustionMassToEnergyFactor;
    combustionEnergyToEmissionFactors: CombustionEnergyToEmissionFactors;
    oilProductionCO2Factors: OilProductionCO2Factors;
    methaneFactorisation: MethaneFactorisation;
  };
  gas: {
    barrelsPerTonne: BarrelsPerTonne;
    barrelsOfOilEquivalent: BarrelsOfOilEquivalent;
    eiaOilNFURatio: EIAOilNFURatio;
    combustionMassToEnergyFactor: CombustionMassToEnergyFactor;
    combustionEnergyToEmissionFactors: CombustionEnergyToEmissionFactors;
    oilProductionCO2Factors: OilProductionCO2Factors;
    methaneFactorisation: MethaneFactorisation;
  };
  coal: {
    barrelsPerTonne: BarrelsPerTonne;
    eiaOilNFURatio: EIAOilNFURatio;
    combustionMassToEnergyFactor: CombustionMassToEnergyFactor;
    combustionEnergyToEmissionFactors: CombustionEnergyToEmissionFactors;
    oilProductionCO2Factors: OilProductionCO2Factors;
    methaneFactorisation: MethaneFactorisation;
  };
};

const ConstantEnum = [
  "BARRELS_PER_TON",
  "PETAJOULES_PER_MILLION_CUBIC_METRES_GAS",
  "BOE_PER_E6M3",
  "EIA_NON_FUEL_USE_RATIO",
  "IPCC_MASS_TO_ENERGY",
  "IPCC_ENERGY_TO_EMISSIONS",
  "PRODUCTION_CO2_FACTOR",
  "METHANE_INTENSITY",
  "METHANE_FACTORISATION",
  "COMBUSTION_EMISSIONS_CO2E_FACTOR",
] as const;

export const Constant = {
  BARRELS_PER_TON: "BARRELS_PER_TON",
  PETAJOULES_PER_MILLION_CUBIC_METRES_GAS:
    "PETAJOULES_PER_MILLION_CUBIC_METRES_GAS",
  BOE_PER_E6M3: "BOE_PER_E6_M3",
  EIA_NON_FUEL_USE_RATIO: "EIA_NON_FUEL_USE_RATIO",
  IPCC_MASS_TO_ENERGY: "IPCC_MASS_TO_ENERGY",
  IPCC_ENERGY_TO_EMISSIONS: "IPCC_ENERGY_TO_EMISSIONS",
  PRODUCTION_CO2_FACTOR: "PRODUCTION_CO2_FACTOR",
  METHANE_INTENSITY: "METHANE_INTENSITY",
  METHANE_FACTORISATION: "METHANE_FACTORISATION",
  COMBUSTION_EMISSIONS_CO2E_FACTOR: "COMBUSTION_EMISSIONS_CO2_E_FACTOR",
} as const;

export type ConstantType = typeof Constant[keyof typeof Constant];

export type DatabaseRecord = {
  id: string;
  constantType: ConstantType;
  authority:
    | "General"
    | "IPCC"
    | "GRFF"
    | "EPA"
    | "BP"
    | "EIA"
    | "Opgee"
    | "IPCC_mc";
  unit: string;
  low: number | null; // P5
  factor: number; // WA
  high: number | null; // P95
  fossilFuelType: "oil" | "coal" | "gas" | null;
  description: string | null;
  reference?: string | null;
  modifier: "GWP100" | "GWP20" | null;
  subtype: string | null;
  country: string | null;
  projectId: number | null;
  quality: number | null;
};

