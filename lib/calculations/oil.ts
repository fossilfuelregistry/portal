import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import { iso, Newtype } from "newtype-ts";
import { Scenarios, multiply, scalarMultiply, scalarAddition, add } from "./utils";
import { isoMethaneIntensity, MethaneIntensity } from "./methane";

/** Oil production [ Kbbls ] */
export interface OilProduction extends Newtype<{ readonly OilProduction: unique symbol }, number> {}
export const isoOilProduction = iso<OilProduction>()

/************************** combustion **********************************/

/**  1. Volume -> Energy  */

/**  Barrels per tonne [  bbls / tonne  ] */
export interface BarrelsPerTonne extends Newtype<{ readonly BarrelsPerTonne: unique symbol }, number> {}
export const isoBarrelsPerTonne = iso<BarrelsPerTonne>()

/**  EIA Oil NFU ratio (U.S.-based) [ % ] */
export interface EIAOilNFURatio extends Newtype<{ readonly EIAOilNFURatio: unique symbol }, number> {}
export const isoEIAOilNFURatio = iso<EIAOilNFURatio>()

/**  Oil: IPCC mass -> energy [ TJ / KT ] */
export interface CombustionMassToEnergyFactor extends Newtype<{ readonly CombustionMassToEnergyFactor: unique symbol }, Scenarios> {}
export const isoCombustionMassToEnergyFactor = iso<CombustionMassToEnergyFactor>()

/**    Energy from oil [  TJ ] */
export interface EnergyFromOil extends Newtype<{ readonly EnergyFromOil: unique symbol }, Scenarios> {}
export const isoEnergyFromOil = iso<EnergyFromOil>()

/**  Energy from oil { P5, WA, P95 } [ TJ ]  */
export const calculateEnergyFromOil = (barrelsPerTonne: BarrelsPerTonne) =>
    (eIAOilNFURatio: EIAOilNFURatio) =>
    (combustionMassToEnergyFactor: CombustionMassToEnergyFactor) =>
    (oilProduction: OilProduction): EnergyFromOil => {
        const _barrelsPerTonne = isoBarrelsPerTonne.unwrap(barrelsPerTonne);
        const _eIAOilNFURatio = isoEIAOilNFURatio.unwrap(eIAOilNFURatio);
        const _combustionMassToEnergyFactor = isoCombustionMassToEnergyFactor.unwrap(combustionMassToEnergyFactor);
        const _oilProduction = isoOilProduction.unwrap(oilProduction)
        const formula = (scenarioMassToEnergyFactor: number) => 
            (_oilProduction / _barrelsPerTonne) * (1-_eIAOilNFURatio) * scenarioMassToEnergyFactor
        const energyFromOil:Scenarios = {
            p5: formula(_combustionMassToEnergyFactor.p5),
            wa: formula(_combustionMassToEnergyFactor.wa),
            p95: formula(_combustionMassToEnergyFactor.p95),  
        }
        return isoEnergyFromOil.wrap(energyFromOil)
    }

/**  2. Energy -> Emissions  */

/**  Oil: IPCC energy -> emissions [ tons (CO2E) / TJ ] */
export interface CombustionEnergyToEmissionFactors extends Newtype<{ readonly CombustionEnergyToEmissionFactors: unique symbol }, Scenarios> {}
export const isoCombustionEnergyToEmissionFactors = iso<CombustionEnergyToEmissionFactors>()

/**   Oil CO2E Combustion emissions [ tons (CO2E) ] */
export interface OilCO2ECombustionEmissions extends Newtype<{ readonly OilCO2ECombustionEmissions: unique symbol }, Scenarios> {}
export const isoOilCO2ECombustionEmissions = iso<OilCO2ECombustionEmissions>()

/**  Oil CO2E Combustion emissions {p5, wa, p95} [ tons (CO2E) ] */
export const calculateCombustionEmissions = (energyFromOil: EnergyFromOil) =>
(energyToEmissionsFactor: CombustionEnergyToEmissionFactors): OilCO2ECombustionEmissions => {
    const _energyFromOil = isoEnergyFromOil.unwrap(energyFromOil)
    const _energyToEmissionsFactor = isoCombustionEnergyToEmissionFactors.unwrap(energyToEmissionsFactor)
    return isoOilCO2ECombustionEmissions.wrap(multiply(_energyFromOil)(_energyToEmissionsFactor))
}


/************************** Production emissions **********************************/

/** CO2 */

/**    Oil Production CO2  [  kg (CO2E)/ bbl  ] */
export interface OilProductionCO2Factors extends Newtype<{ readonly OilProductionCO2Factors: unique symbol }, Scenarios> {}
export const isoOilProductionCO2Factors = iso<OilProductionCO2Factors>()

/**     Oil CO2 Production emissions [ tons (CO2) ] */
export interface OilCO2ProductionEmissions extends Newtype<{ readonly OilCO2ProductionEmissions: unique symbol }, Scenarios> {}
export const isoOilCO2ProductionEmissions = iso<OilCO2ProductionEmissions>()

export const calculateOilCO2ProductionEmissions = (oilProduction: OilProduction) =>
    (oilProductionCO2Factors: OilProductionCO2Factors): OilCO2ProductionEmissions => {
        const _oilProduction = isoOilProduction.unwrap(oilProduction)
        const _oilProductionCO2Factors = isoOilProductionCO2Factors.unwrap(oilProductionCO2Factors)

        return isoOilCO2ProductionEmissions.wrap(scalarMultiply(_oilProduction)(_oilProductionCO2Factors))
    }

/** CO4 */

/**   Methane releases [ tons CH4 ] */
export interface OilMethaneReleases extends Newtype<{readonly OilMethaneReleases: unique symbol }, number> {}
export const isoOilMethaneReleases = iso<OilMethaneReleases>()

export const calculateOilMethaneReleases = (oilProduction: OilProduction) =>
    (methaneIntensity: MethaneIntensity): OilMethaneReleases => {
        const _oilProduction = isoOilProduction.unwrap(oilProduction)
        const _methaneIntensity = isoMethaneIntensity.unwrap(methaneIntensity)
        return isoOilMethaneReleases.wrap(_oilProduction * _methaneIntensity)
    }

    /** Oil Methane factorisation  [ CH4 / CO2 ratio ] */
export interface MethaneFactorisation extends Newtype<{readonly MethaneFactorisation: unique symbol }, number> {}
export const isoMethaneFactorisation = iso<MethaneFactorisation>()

/** Oil CO2E of methane [ CO2e tons ] */
export interface OilCO2EOfMethane extends Newtype<{readonly OilCO2EOfMethane: unique symbol }, number> {}
export const isoOilCO2EOfMethane = iso<OilCO2EOfMethane>()

export const calculateOilCO2EOfMethane = (methaneReleases: OilMethaneReleases) => 
    (methaneFactorisation: MethaneFactorisation): OilCO2EOfMethane => {
        const _methaneReleases = isoOilMethaneReleases.unwrap(methaneReleases)
        const _methaneFactorisation = isoMethaneFactorisation.unwrap(methaneFactorisation)
        return isoOilCO2EOfMethane.wrap(_methaneReleases * _methaneFactorisation)
    }

/**  Oil CO2E Production emissions [ tons (CO2E) ] */
export interface OilCO2EProductionEmissions extends Newtype<{ readonly OilCO2EProductionEmissions: unique symbol }, Scenarios> {}
export const isoOilCO2EProductionEmissions = iso<OilCO2EProductionEmissions>()

export const calculateOilCO2EProductionEmissions = (oilCO2ProductionEmissions: OilCO2ProductionEmissions) =>
(oilCO2EOfMethane: OilCO2EOfMethane): OilCO2EProductionEmissions => {
    const _oilCO2ProductionEmissions = isoOilCO2ProductionEmissions.unwrap(oilCO2ProductionEmissions)
    const _oilCO2EOfMethane = isoOilCO2EOfMethane.unwrap(oilCO2EOfMethane)
    return isoOilCO2EProductionEmissions.wrap(scalarAddition(_oilCO2EOfMethane)(_oilCO2ProductionEmissions))
}

/** Oil CO2E emission [ tons (CO2E) ] */
export interface TotalOilCO2EEmissions extends Newtype<{ readonly TotalOilCO2EEmissions: unique symbol }, Scenarios> {}
export const isoTotalOilCO2EEmissions = iso<TotalOilCO2EEmissions>()

export const calculateTotalOilCO2EEmissions = (combustionEmissions: OilCO2ECombustionEmissions) =>
(productionEmissions: OilCO2EProductionEmissions): TotalOilCO2EEmissions => {
    const combustion = isoOilCO2ECombustionEmissions.unwrap(combustionEmissions)
    const production = isoOilCO2EProductionEmissions.unwrap(productionEmissions)

    return pipe(
        add,
        ap(combustion),
        ap(production),
        isoTotalOilCO2EEmissions.wrap
    )
}