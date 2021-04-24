import { Select } from "antd"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import useText from "lib/useText"

export default function CarbonIntensitySelector() {
	const constants = useSelector( redux => redux.conversions )
	const gwp = useSelector( redux => redux.gwp )
	const [ options, set_options ] = useState( [] )
	const [ value, set_value ] = useState()
	const dispatch = useDispatch()
	const { getText } = useText()

	useEffect( () => {
		if( !constants?.length ) return
		const co2Units = constants.filter( c => c.toUnit.startsWith( 'kgco2e' ) && !( c.fossilFuelType === 'gas' ) )
		console.log( { co2Units, constants } )
		const _options = co2Units.map( c => ( {
			...c,
			label: `${c.authority} ${c.modifier ?? ''} ${c.country?.toUpperCase() ?? ''}`
		} ) )

		set_options( _options )
	}, [ constants ] )

	return (
		<Select
			style={{ minWidth: 120, width: '100%' }}
			value={{ value: gwp }}
			labelInValue={true}
			placeholder={getText( 'carbon_intensity' )}
			onChange={v => {
				set_value( v )
				dispatch( { type: 'GWP', payload: v.value } )
			}}
		>
			{options.map( c => ( <Select.Option key={c.toUnit}>{c.label}</Select.Option> ) )}
		</Select>
	)
}
