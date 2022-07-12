import { findFirst } from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { DatabaseRecord } from "./types";
import {
  isoBarrelsPerTonne,
  isoCombustionEnergyToEmissionFactors,
  isoCombustionMassToEnergyFactor,
  isoEIAOilNFURatio,
  isoOilProductionCO2Factors,
} from "../oil/oil";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/lib/Option";
import {
  isoBOEPere6m3,
  isoEIAGasNFURatioGlobally,
  isoGasIPCCEnergyToEmissionsFactors,
  isoGasProductionCO2,
  isoPetajoulesPerMillionCubicMeterGas,
} from "../gas/gas";
import { isoCoalMethaneEmissionsMidPoint, isoTonsCO2EPerTon } from "../coal/coal";
import { isoMethaneFactorisation, isoMethaneIntensity } from "../methane";
import { sequenceS } from "fp-ts/lib/Apply";
import {
  isBarrelsPerTon,
  isPetaJoulePerMillionCubicMetreGas,
  isBOEPerE6M3,
  isEIANonFuelUseRatio,
  isIPCCMassToEnergy,
  allScenariosExists,
  isIPCCEnergyToEmission,
  isProductionCO2Factor,
  isMethaneIntensity,
  isMethaneFactorisation,
  isCombustionEmissionCO2EFactor,
} from "./predicates";
import {
  filterByFossilFuelType,
  filterByConstantType,
  orderByPriority,
  applyCountryFilter,
  applyModifierFilter,
  applyProjectFilter,
} from "./filter";

const barrelsPerTonne = flow(
  findFirst(isBarrelsPerTon),
  O.map((x) => x.factor),
  E.fromOption(
    () => new Error("Could not found any  value for BARRELS_PER_TON")
  )
);
const petaJoulePerMillionCubicMetreGas = flow(
  findFirst(isPetaJoulePerMillionCubicMetreGas),
  O.map((x) => x.factor),
  E.fromOption(
    () =>
      new Error(
        "Could not found any  value for PETAJOULES_PER_MILLION_CUBIC_METRES_GAS"
      )
  )
);
const boePerE6M3 = flow(
  findFirst(isBOEPerE6M3),
  O.map((x) => x.factor),
  E.fromOption(() => new Error("Could not found any value for BOE_PER_E6M3"))
);
const eiaNonFuelUseRatio = flow(
  findFirst(isEIANonFuelUseRatio),
  O.map((x) => x.factor),
  E.fromOption(
    () => new Error("Could not found any value for EIA_NON_FUEL_USE_RATIO")
  )
);
const ipccMassToEnergy = flow(
  findFirst(isIPCCMassToEnergy),
  E.fromOption(
    () => new Error("Could not found any value for IPCC_MASS_TO_ENERGY")
  ),
  E.chain(
    E.fromPredicate(
      allScenariosExists,
      (e) => new Error(`All scenarios are not set for id: ${e.id}`)
    )
  ),
  E.map((x) => ({ p5: x.low!, wa: x.factor, p95: x.high! }))
);
const ipccEnergyToEmission = flow(
  findFirst(isIPCCEnergyToEmission),
  E.fromOption(
    () => new Error("Could not found any value for IPCC_ENERGY_TO_EMISSIONS")
  ),
  E.chain(
    E.fromPredicate(
      allScenariosExists,
      (e) => new Error(`All scenarios are not set for id: ${e.id}`)
    )
  ),
  E.map((x) => ({ p5: x.low!, wa: x.factor, p95: x.high! }))
);
const productionCO2Factor = flow(
  findFirst(isProductionCO2Factor),
  E.fromOption(
    () => new Error("Could not found any value for PRODUCTION_CO2_FACTOR")
  ),
  E.chain(
    E.fromPredicate(
      allScenariosExists,
      (e) => new Error(`All scenarios are not set for id: ${e.id}`)
    )
  ),
  E.map((x) => ({ p5: x.low!, wa: x.factor, p95: x.high! }))
);
const methaneIntensity = flow(
  findFirst(isMethaneIntensity),
  O.map((x) => x.factor),
  E.fromOption(
    () => new Error("Could not found any value for METHANE_INTENSITY")
  )
);
const methaneFactorisation = flow(
  findFirst(isMethaneFactorisation),
  O.map((x) => x.factor),
  E.fromOption(
    () => new Error("Could not found any value for METHANE_FACTORISATION")
  )
);

const combustionEmissionCO2EFactor = flow(
  findFirst(isCombustionEmissionCO2EFactor),
  E.fromOption(
    () =>
      new Error(
        "Could not found any value for COMBUSTION_EMISSIONS_CO2E_FACTOR"
      )
  ),
  E.chain(
    E.fromPredicate(
      allScenariosExists,
      (e) => new Error(`All scenarios are not set for id: ${e.id}`)
    )
  ),
  E.map((x) => ({ p5: x.low!, wa: x.factor, p95: x.high! }))
);
const generateOilVariables = (filteredRecords: DatabaseRecord[]) => {
  const oilRecords = pipe(filteredRecords);
  return {
    barrelsPerTonne: pipe(
      oilRecords,
      barrelsPerTonne,
      E.map(isoBarrelsPerTonne.wrap)
    ),
    eiaOilNFURatio: pipe(
      oilRecords,
      eiaNonFuelUseRatio,
      E.map(isoEIAOilNFURatio.wrap)
    ),
    combustionMassToEnergyFactor: pipe(
      oilRecords,
      ipccMassToEnergy,
      E.map(isoCombustionMassToEnergyFactor.wrap)
    ),
    combustionEnergyToEmissionFactors: pipe(
      oilRecords,
      ipccEnergyToEmission,
      E.map(isoCombustionEnergyToEmissionFactors.wrap)
    ),
    oilProductionCO2Factors: pipe(
      oilRecords,
      productionCO2Factor,
      E.map(isoOilProductionCO2Factors.wrap)
    ),
    methaneFactorisation: pipe(
      oilRecords,
      methaneFactorisation,
      E.map(isoMethaneFactorisation.wrap)
    ),
    methaneIntensity: pipe(
      oilRecords,
      methaneIntensity,
      E.map(isoMethaneIntensity.wrap)
    )
  };
};
const generateCoalVariables = (filteredRecords: DatabaseRecord[]) => {
  const coalRecords = pipe(filteredRecords);
  return {
    tonsCO2EPerTon: pipe(
      coalRecords,
      combustionEmissionCO2EFactor,
      E.map(isoTonsCO2EPerTon.wrap)
    ),
    coalMethaneEmissionsMidPoint: pipe(
      coalRecords,
      methaneIntensity,
      E.map(isoCoalMethaneEmissionsMidPoint.wrap)
    ),
    methaneFactorisation: pipe(
      coalRecords,
      methaneFactorisation,
      E.map(isoMethaneFactorisation.wrap)
    ),
  };
};
const generateGasVariables = (filteredRecords: DatabaseRecord[]) => {
  const gasRecords = pipe(filteredRecords);
  return {
    petajoulesPerMillionCubicMeterGas: pipe(
      gasRecords,
      petaJoulePerMillionCubicMetreGas,
      E.map(isoPetajoulesPerMillionCubicMeterGas.wrap)
    ),
    eiaGasNFURatioGlobally: pipe(
      gasRecords,
      eiaNonFuelUseRatio,
      E.map(isoEIAGasNFURatioGlobally.wrap)
    ),
    gasIPCCEnergyToEmissionsFactors: pipe(
      gasRecords,
      ipccEnergyToEmission,
      E.map(isoGasIPCCEnergyToEmissionsFactors.wrap)
    ),
    boePere6m3: pipe(gasRecords, boePerE6M3, E.map(isoBOEPere6m3.wrap)),
    gasProductionCO2: pipe(
      gasRecords,
      productionCO2Factor,
      E.map(isoGasProductionCO2.wrap)
    ),
    methaneIntensity: pipe(
      gasRecords,
      methaneIntensity,
      E.map(isoMethaneIntensity.wrap)
    ),
    methaneFactorisation: pipe(
      gasRecords,
      methaneFactorisation,
      E.map(isoMethaneFactorisation.wrap)
    ),
  };
};

export type Filters = {
  country?: string | null;
  projectId?: number | null;
  modifier: string;
};
const getCalculationConstants =
  ({ country, projectId, modifier }: Filters) =>
  (filteredRecords: DatabaseRecord[]) => {
    const filtered = pipe(
      filteredRecords,
      applyCountryFilter(country),
      applyModifierFilter(modifier),
      applyProjectFilter(projectId)
    );
    const oil = pipe(
      filtered,
      filterByFossilFuelType("oil"),
      A.sort(orderByPriority),
      generateOilVariables,
      sequenceS(E.Apply)
    );
    const gas = pipe(
      filtered,
      filterByFossilFuelType("gas"),
      A.sort(orderByPriority),
      generateGasVariables,
      sequenceS(E.Apply)
    );
    const coal = pipe(
      filtered,
      filterByFossilFuelType("coal"),
      A.sort(orderByPriority),
      generateCoalVariables,
      sequenceS(E.Apply)
    );

    return pipe(
      {
        oil,
        gas,
        coal,
      },
      sequenceS(E.Applicative),

      E.getOrElseW((e) => {
        throw e;
      })
    );
  };

  export type CalculationConstants =  ReturnType<ReturnType<typeof getCalculationConstants>>
export default getCalculationConstants;
