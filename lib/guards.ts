import settings from "settings";
import { FossilFuelType } from "./types";

export const isSupportedFuel = (fuel: unknown): fuel is FossilFuelType => {
    return typeof fuel === 'string' && settings.supportedFuels.includes(fuel as FossilFuelType)
}

