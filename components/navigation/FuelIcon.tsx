import IconGas from "../../public/SVG/gas.svg";
import IconCoal from "../../public/SVG/coal.svg";
import IconOil from "../../public/SVG/oil.svg";
import IconEmissions from "../../public/SVG/emissions.svg";
import React from "react";

export type Props = {
  fuel: "gas" | "oil" | "coal" | "emissions";
  height: number;
  width?: number;
  padding?: number;
};

const FuelIcon: React.FC<Props> = ( { fuel, height, width, padding } ) =>  {
	const icons = {
		gas: <IconGas />,
		coal: <IconCoal />,
		oil: <IconOil />,
		emissions: <IconEmissions />,
	};

	if ( !Object.keys( icons ).includes( fuel ) ) return null

	const icon = React.cloneElement( icons[ fuel ], { height, width: width ?? height } );

	if ( padding && padding > 0 ) return <div style={{ padding }}>{icon}</div>;
	else return icon;
}

export default FuelIcon