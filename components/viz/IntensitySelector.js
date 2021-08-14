import { Select } from "antd"
import { useDispatch, useSelector } from "react-redux"
import useText from "lib/useText"

export default function CarbonIntensitySelector() {
	const constants = useSelector( redux => redux.conversions )
	const gwp = useSelector( redux => redux.gwp )
	const dispatch = useDispatch()
	const { getText } = useText()

	return (
		<Select
			style={{ minWidth: 120, width: '100%' }}
			value={{ value: gwp }}
			labelInValue={true}
			placeholder={getText( 'carbon_intensity' )}
			onChange={v => {
				dispatch( { type: 'GWP', payload: v.value } )
			}}
		>
			<Select.Option value="GWP100">GWP100</Select.Option>
			<Select.Option value="GWP20">GWP20</Select.Option>
		</Select>
	)
}
