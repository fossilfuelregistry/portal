import IconGas from "../../public/SVG/gas.svg"
import IconCoal from "../../public/SVG/coal.svg"
import IconOil from "../../public/SVG/oil.svg"
import React from "react"

export default function FuelIcon( { fuel, height, width, padding } ) {
	const icons = {
		gas: <IconGas/>,
		coal: <IconCoal/>,
		oil: <IconOil/>,
	}

	let icon
	if( !Object.keys( icons ).includes( fuel ) )
		icon = ''
	else
		icon = React.cloneElement( icons[ fuel ], { height, width: width ?? height } )

	if( padding > 0 )
		return <div style={ { padding } }>{ icon }</div>
	else
		return icon
}