import { FossilFuelType } from "lib/types";
import { Scenarios } from "./utils";

export type Meta = {
    country: string
    fuel: FossilFuelType
}

export type CO2EEmissions = {
    [f in "scope1" | "scope3" | "total"]: {
        [p in "co2" | "total" | "ch4"]:Scenarios
    }
}