import { useSelector } from "react-redux";
import { Store } from "./types";

const useNumberFormatter = () => {
	const locale = useSelector( ( state: Store ) => state.locale );

	const format = ( number: number, decimals = 0 ) =>
		new Intl.NumberFormat( locale, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		} ).format( number );
	return format;
};

export default useNumberFormatter;
