/** CO4 */

import { iso, Newtype } from "newtype-ts"

/**  Methane intensity [ kg CH4 / bbl ] */
export interface MethaneIntensity extends Newtype<{readonly MethaneIntensity: unique symbol }, number> {}
export const isoMethaneIntensity = iso<MethaneIntensity>()

/** Methane factorisation  [ CH4 / CO2 ratio ] */
export interface MethaneFactorisation extends Newtype<{readonly MethaneFactorisation: unique symbol }, number> {}
export const isoMethaneFactorisation = iso<MethaneFactorisation>()
