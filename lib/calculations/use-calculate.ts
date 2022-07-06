import { Store } from "lib/types";
import { useSelector } from "react-redux";
import { useCalculationConstants } from "./calculation-constants/use-calculation-constants";
import { usePrefixConversion } from "./prefix-conversion"

const useCalculateOil = () => {
    const country = useSelector( (redux: Store) => redux.country )
    const modifier = useSelector( (redux: Store) => redux.gwp )

    const prefixConversion = usePrefixConversion();
    const constants = useCalculationConstants({country, modifier});


}  