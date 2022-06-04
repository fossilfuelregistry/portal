/** Volume */

import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import { iso, Newtype } from "newtype-ts";
import { THOUSANDS_IN_A_MILLION_RATIO } from "./gas";
import { isoMethaneFactorisation, MethaneFactorisation } from "./methane";
import { scalarAddition, scalarMultiply, Scenarios } from "./utils";

/**  Coal Production [ KT ] */
export interface CoalProduction extends Newtype<{ readonly CoalProduction: unique symbol }, number> {}
export const isoCoalProduction = iso<CoalProduction>()

/** Combustion Emissions */
/**  Volume -> Energy -> Emissions  */

/**  Tons CO2E per ton [ tons (CO2E) / ton ] */
export interface TonsCO2EPerTon extends Newtype<{ readonly TonsCO2EPerTon: unique symbol }, Scenarios> {}
export const isoTonsCO2EPerTon = iso<TonsCO2EPerTon>()

/**  Coal CO2E Combustion emissions [ e6tons (CO2E) ] */
export interface CoalCO2ECombustionEmissions extends Newtype<{ readonly CoalCO2ECombustionEmissions: unique symbol }, Scenarios> {}
export const isoCoalCO2ECombustionEmissions = iso<CoalCO2ECombustionEmissions>()

export const calculateCoalCO2ECombustionEmissions = (coalProduction: CoalProduction) => 
    (tonsCO2EPerTon: TonsCO2EPerTon): CoalCO2ECombustionEmissions  => {
        const _coalProduction = isoCoalProduction.unwrap(coalProduction)
        const _tonsCO2EPerTon = isoTonsCO2EPerTon.unwrap(tonsCO2EPerTon)
        return isoCoalCO2ECombustionEmissions.wrap(scalarMultiply(THOUSANDS_IN_A_MILLION_RATIO * _coalProduction)(_tonsCO2EPerTon))
}

/** Methane Emissions from Production */

/**  Methane emissions mid-point [ kg (CH4) / ton ] */
export interface CoalMethaneEmissionsMidPoint extends Newtype<{ readonly CoalMethaneEmissionsMidPoint: unique symbol }, number> {}
export const isoCoalMethaneEmissionsMidPoint = iso<CoalMethaneEmissionsMidPoint>()

/**  Methane releases [ kg (CH4) ] */
export interface CoalMethaneReleases extends Newtype<{ readonly CoalMethaneReleases: unique symbol }, number> {}
export const isoCoalMethaneReleases = iso<CoalMethaneReleases>()

export const calculateCoalMethaneReleases = (coalProduction: CoalProduction) => 
    (coalMethaneEmissionsMidPoint: CoalMethaneEmissionsMidPoint): CoalMethaneReleases =>{
        const _coalProduction = isoCoalProduction.unwrap(coalProduction)
        const _coalMethaneEmissionsMidPoint = isoCoalMethaneEmissionsMidPoint.unwrap(coalMethaneEmissionsMidPoint)
        return pipe(
            _coalMethaneEmissionsMidPoint * _coalProduction, 
            isoCoalMethaneReleases.wrap,
        )
    }


/** Coal CO2E Production emissions mid-point [ tons (CO2E) ] */
export interface CoalCO2EProductionEmission extends Newtype<{ readonly CoalCO2EProductionEmission: unique symbol }, number> {}
export const isoCoalCO2EProductionEmission = iso<CoalCO2EProductionEmission>()

export const calculateCoalCO2EProductionEmission = (coalProduction: CoalProduction) =>
(coalMethaneEmissionsMidPoint: CoalMethaneEmissionsMidPoint)=>
(methaneFactorisation: MethaneFactorisation): CoalCO2EProductionEmission => {
    const production = isoCoalProduction.unwrap(coalProduction)
    const methaneEmissionsMidPoint = isoCoalMethaneEmissionsMidPoint.unwrap(coalMethaneEmissionsMidPoint)
    const _methaneFactorisation = isoMethaneFactorisation.unwrap(methaneFactorisation)

    return pipe(
        production * methaneEmissionsMidPoint * _methaneFactorisation,
        isoCoalCO2EProductionEmission.wrap
    )
}

/** Coal CO2E emission [ tons (CO2E) ] */
export interface TotalCoalCO2EEmissions extends Newtype<{ readonly TotalCoalCO2EEmissions: unique symbol }, Scenarios> {}
export const isoTotalCoalCO2EEmissions = iso<TotalCoalCO2EEmissions>()

export const calculateTotalCoalCO2EEmissions = (combustionEmissions: CoalCO2ECombustionEmissions) =>
(productionEmissions: CoalCO2EProductionEmission): TotalCoalCO2EEmissions => {
    const combustion = isoCoalCO2ECombustionEmissions.unwrap(combustionEmissions)
    const production = isoCoalCO2EProductionEmission.unwrap(productionEmissions)

    return pipe(
        scalarAddition,
        ap(production),
        ap(combustion),
        isoTotalCoalCO2EEmissions.wrap
    )
}