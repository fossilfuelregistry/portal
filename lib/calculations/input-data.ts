import { iso, Newtype } from "newtype-ts";

interface ISO3166 extends Newtype<{ readonly ISO3166: unique symbol }, string> {}
const isoIso3166 = iso<ISO3166>()

type MethanFactorisation = 'GWP20' | 'WGP100'

/** Oil production [ Kbbls ] */
interface OilProduction extends Newtype<{ readonly OilProduction: unique symbol }, number> {}
const isoOilProduction = iso<OilProduction>()

/** Gas production [  bln m3 ] */
interface GasProduction extends Newtype<{ readonly GasProduction: unique symbol }, number> {}
const isoGasProduction = iso<GasProduction>()

/**  Coal Production [ KT ] */
interface CoalProduction extends Newtype<{ readonly CoalProduction: unique symbol }, number> {}
const isoCoalProduction = iso<CoalProduction>()