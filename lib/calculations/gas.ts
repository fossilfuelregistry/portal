import { pipe } from "fp-ts/lib/function";
import { ap } from "fp-ts/lib/Identity";
import { iso, Newtype } from "newtype-ts";
import { isoMethaneFactorisation, isoMethaneIntensity, MethaneFactorisation, MethaneIntensity } from "./methane";
import { isoOilCO2EOfMethane } from "./oil";
import { add, scalarAddition, scalarMultiply, Scenarios } from "./utils";

/** Volume */

/**  Gas Production [ bln m3 ] */
export interface GasProduction extends Newtype<{ readonly GasProduction: unique symbol }, number> {}
export const isoGasProduction = iso<GasProduction>()

/** Combustion Emissions */
/**  1. Volume -> Energy  */

/**  Petajoules per million cubic metres gas [  PJ / e9m3 ] */
export interface PetajoulesPerMillionCubicMeterGas extends Newtype<{ readonly PetajoulesPerMillionCubicMeterGas: unique symbol }, number> {}
export const isoPetajoulesPerMillionCubicMeterGas = iso<PetajoulesPerMillionCubicMeterGas>()

/**  Gas energy [ Petajoules ] */
export interface GasEnergy extends Newtype<{ readonly GasEnergy: unique symbol }, number> {}
export const isoGasEnergy = iso<GasEnergy>()

export const calculateGasEnergy = (gasProduction: GasProduction) =>
    (petajoulesPerMillionCubicMeterGas: PetajoulesPerMillionCubicMeterGas): GasEnergy => {
        const _gasProduction = isoGasProduction.unwrap(gasProduction)
        const _petajoulesPerMillionCubicMeterGas = isoPetajoulesPerMillionCubicMeterGas.unwrap(petajoulesPerMillionCubicMeterGas)
        return isoGasEnergy.wrap(_gasProduction * _petajoulesPerMillionCubicMeterGas)
    }

/**  2. Energy -> Emissions  */

export const THOUSANDS_IN_A_MILLION_RATIO = 1000

/**  EIA Gas NFU ratio globally  (U.S.-based)  [ % ] */
export interface EIAGasNFURatioGlobally extends Newtype<{ readonly EIAGasNFURatioGlobally: unique symbol }, number> {}
export const isoEIAGasNFURatioGlobally = iso<EIAGasNFURatioGlobally>()

/**  Gas: IPCC energy -> emissions  [ tons (CO2E) / TJ ] */
export interface GasIPCCEnergyToEmissionsFactors extends Newtype<{ readonly GasIPCCEnergyToEmissionsFactors: unique symbol }, Scenarios> {}
export const isoGasIPCCEnergyToEmissionsFactors = iso<GasIPCCEnergyToEmissionsFactors>()

/**  Gas CO2E Combustion emissions [ tons (CO2E) ] */
export interface GasCO2ECombustionEmissions extends Newtype<{ readonly GasCO2ECombustionEmissions: unique symbol }, Scenarios> {}
export const isoGasCO2ECombustionEmissions = iso<GasCO2ECombustionEmissions>()

export const calculateGasCO2ECombustionEmissions = (gasEnergy: GasEnergy) => 
    (eiaGasNFURatioGlobally: EIAGasNFURatioGlobally) =>
    (gasIPCCEnergyToEmissionsFactors: GasIPCCEnergyToEmissionsFactors): GasCO2ECombustionEmissions =>
    {
        const _gasEnergy  = isoGasEnergy.unwrap(gasEnergy)
        const _eiaGasNFURatioGlobally  = isoEIAGasNFURatioGlobally.unwrap(eiaGasNFURatioGlobally)
        const _gasIPCCEnergyToEmissionsFactors  = isoGasIPCCEnergyToEmissionsFactors .unwrap(gasIPCCEnergyToEmissionsFactors)

        return isoGasCO2ECombustionEmissions.wrap(
            scalarMultiply(_gasEnergy * 
                THOUSANDS_IN_A_MILLION_RATIO *
                (1 - _eiaGasNFURatioGlobally)
                )(_gasIPCCEnergyToEmissionsFactors)
        )
    }


/** Production Emissions */
/**  Current Production */
/**  Boe per e6m3 [ e6boe / e9m3 ] */
export interface BOEPere6m3 extends Newtype<{ readonly BOEPere6m3: unique symbol }, number> {}
export const isoBOEPere6m3 = iso<BOEPere6m3>()

/**  Barrels of oil equivalent [ boe ] */
export interface BarrelsOfOilEquivalent extends Newtype<{ readonly BarrelsOfOilEquivalent: unique symbol }, number> {}
export const isoBarrelsOfOilEquivalent = iso<BarrelsOfOilEquivalent>()

/**  CO2 */

/**  Gas Production CO2 [ kg (CO2E) / boe ] */
export interface GasProductionCO2 extends Newtype<{ readonly GasProductionCO2: unique symbol }, Scenarios> {}
export const isoGasProductionCO2 = iso<GasProductionCO2>()

/**  Gas CO2 Production emissions [ tons (CO2E) ] */
export interface GasCO2ProductionEmissions extends Newtype<{ readonly GasCO2PRoductionEmissions: unique symbol }, Scenarios> {}
export const isoGasCO2ProductionEmissions = iso<GasCO2ProductionEmissions>()

export const calculateGasCO2ProductionEmissions = (barrelsOfOilEquivalent: BarrelsOfOilEquivalent) => 
    (gasProductionCO2: GasProductionCO2): GasCO2ProductionEmissions => {
        const _barrelsOfOilEquivalent = isoBarrelsOfOilEquivalent.unwrap(barrelsOfOilEquivalent)
        const _gasProductionCO2 = isoGasProductionCO2.unwrap(gasProductionCO2)
        
        return isoGasCO2ProductionEmissions.wrap(scalarMultiply(_barrelsOfOilEquivalent/THOUSANDS_IN_A_MILLION_RATIO)(_gasProductionCO2))
    }

/**  CH4  */

/**  Methane releases [ tons CH4 ] */
export interface GasMethaneReleases extends Newtype<{ readonly MethaneReleases: unique symbol }, number> {}
export const isoGasMethaneReleases = iso<GasMethaneReleases>()

export const calculateGasMethaneReleases = (barrelsOfOilEquivalent: BarrelsOfOilEquivalent) =>
    (methaneIntensity: MethaneIntensity): GasMethaneReleases => {
        const _barrelsOfOilEquivalent = isoBarrelsOfOilEquivalent.unwrap(barrelsOfOilEquivalent)
        const _methaneIntensity = isoMethaneIntensity.unwrap(methaneIntensity)

        return isoGasMethaneReleases.wrap(_barrelsOfOilEquivalent * _methaneIntensity / THOUSANDS_IN_A_MILLION_RATIO)
    }
    
/** Oil CO2E of methane [ CO2e tons ] */
export interface GasCO2EOfMethane extends Newtype<{readonly GasCO2EOfMethane: unique symbol }, number> {}
export const isoGasCO2EOfMethane = iso<GasCO2EOfMethane>()

export const calculateGasCO2EOfMethane = (methaneReleases: GasMethaneReleases) => 
    (methaneFactorisation: MethaneFactorisation): GasCO2EOfMethane => {
        const _methaneReleases = isoGasMethaneReleases.unwrap(methaneReleases)
        const _methaneFactorisation = isoMethaneFactorisation.unwrap(methaneFactorisation)
        return isoGasCO2EOfMethane.wrap(_methaneReleases * _methaneFactorisation)
    }

    /**  Upstream Total  */

    /**  Gas CO2E Production emissions [ tons (CO2E) ] */
    export interface GasCO2EProductionEmissions extends Newtype<{ readonly GasCO2EProductionEmissions: unique symbol }, Scenarios> {}
    export const isoGasCO2EProductionEmissions = iso<GasCO2EProductionEmissions>()
    
    export const calculateGasCO2EProductionEmissions = (gasCO2ProductionEmissions: GasCO2ProductionEmissions) =>
        (gasCO2EOfMethane: GasCO2EOfMethane): GasCO2EProductionEmissions => {
            const _gasCO2ProductionEmissions = isoGasCO2ProductionEmissions.unwrap(gasCO2ProductionEmissions)
            const _gasCO2EOfMethane = isoGasCO2EOfMethane.unwrap(gasCO2EOfMethane)
            return isoGasCO2EProductionEmissions.wrap(scalarAddition(_gasCO2EOfMethane)(_gasCO2ProductionEmissions))
        }

/** Gas CO2E emission [ tons (CO2E) ] */
export interface TotalGasCO2EEmissions extends Newtype<{ readonly TotalGasCO2EEmissions: unique symbol }, Scenarios> {}
export const isoTotalGasCO2EEmissions = iso<TotalGasCO2EEmissions>()

export const calculateTotalGasCO2EEmissions = (combustionEmissions: GasCO2ECombustionEmissions) =>
(productionEmissions: GasCO2EProductionEmissions): TotalGasCO2EEmissions => {
    const combustion = isoGasCO2ECombustionEmissions.unwrap(combustionEmissions)
    const production = isoGasCO2EProductionEmissions.unwrap(productionEmissions)

    return pipe(
        add,
        ap(combustion),
        ap(production),
        isoTotalGasCO2EEmissions.wrap
    )
}