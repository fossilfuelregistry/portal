import React from "react"
import { Select } from "antd"
import { useDispatch, useSelector, useStore } from "react-redux"
import useText from "lib/useText"
import { co2PageUpdateQuery } from "components/CO2Forecast/calculate"
import { useRouter } from "next/router"

export default function CarbonIntensitySelector() {
	const constants = useSelector( redux => redux.conversions )
	const gwp = useSelector( redux => redux.gwp )
	const dispatch = useDispatch()
	const { getText } = useText()
	const store = useStore()
	const router = useRouter()

	return (
		<Select
			style={ { minWidth: 120, width: '100%' } }
			value={ { value: gwp } }
			labelInValue={ true }
			placeholder={ getText( 'carbon_intensity' ) }
			onChange={ async v => {
				dispatch( { type: 'GWP', payload: v.value } )
				await co2PageUpdateQuery( store, router, 'gwp', v.value )
			} }
		>
			<Select.Option value="GWP100">GWP100</Select.Option>
			<Select.Option value="GWP20">GWP20</Select.Option>
		</Select>
	)
}
