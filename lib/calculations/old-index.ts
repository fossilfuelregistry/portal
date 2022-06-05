import { pipe } from 'fp-ts/lib/function'
import { Newtype, iso } from 'newtype-ts'






interface UNIT extends Newtype<{ readonly UNIT: unique symbol }, string> {}





/**
 * 
 * VOLUME TO ENERGY
 * 
 */



type Unit = {
    unit: string,
}

type ISO3166 = string

type EmissionFactors = {
    p5: number
    wa: number
    p95: number
}

type Emissions = {
    p5: number
    wa: number
    p95: number
}

interface OilProductionEmissionFactors extends Newtype<{ readonly OilProductionEmissionFactors: unique symbol }, EmissionFactors> {}
const oilProductionEmissionFactors = iso<OilProductionEmissionFactors>()

interface OilCombustionEmissionFactors extends Newtype<{ readonly OilCombustionEmissionFactors: unique symbol }, EmissionFactors> {}
const oilCombustionEmissionFactors = iso<OilCombustionEmissionFactors>()

interface OilProductionEmissions extends Newtype<{ readonly OilProductionEmissions: unique symbol }, EmissionFactors> {}
const oilProductionEmissions = iso<OilProductionEmissions>()

interface OilCombustionEmissions extends Newtype<{ readonly OilCombustionEmissions: unique symbol }, EmissionFactors> {}
const oilCombustionEmissions = iso<OilCombustionEmissions>()

const calculateCO2Emissions = (volume: number) => (factors: EmissionFactors): Emissions => {
    const {p5, wa, p95} = factors
    return {
      p5: p5 * volume,
      wa: wa * volume,
      p95: p95 * volume,
    };
}


interface OilProductionVolume extends Newtype<{ readonly OilProductionVolume: unique symbol }, OilProductionVolume> {}
const oilProductionVolume = iso<OilProductionVolume>()


const calculateTotalCO2Emissions = 
(volume: number) => 
(productionEmissionFactors: EmissionFactors) =>
(combustionEmissionFactors: EmissionFactors): Emissions => {
}




type OilCO2Emission = {
    p5: number
    wa: number
    p95: number
}



interface CO2 extends Newtype<{ readonly CO2: unique symbol }, number> {}
const isoCO2 = iso<CO2>()

interface CO4 extends Newtype<{ readonly CO4: unique symbol }, number> {}
const isoCO4 = iso<CO4>()

interface CO2E extends Newtype<{ readonly CO2E: unique symbol }, number> {}
const isoCO2E = iso<CO2E>()




const sum = (a:number) => (b:number): number => a + b

const calculateCO2E = (co2: CO2) => (co4: CO4): CO2E =>  pipe(
    sum( isoCO2.unwrap(co2))(isoCO4.unwrap(co4)),
    isoCO2E.wrap
)



const co2 = isoCO2.wrap(10)
const co4 = isoCO4.wrap(5)

pipe(
    calculateCO2E(co2)(co4),
    console.log
)
