import { Select } from "antd"
import useText from "lib/useText"
import settings from "../../settings"

export default function FossilFuelTypeSelector( { onChange } ) {
	const { getText } = useText()

	const fossilFuelTypes = settings.supportedFuels

	return (
		<Select
			style={ { minWidth: 200, width: '100%' } }
			placeholder={ getText( 'fossil_fuel_type' ) + '...' }
			onChange={ onChange }
		>
			{ fossilFuelTypes.map( c => ( <Select.Option key={ c }>{ getText( c ) }</Select.Option> ) ) }
		</Select>
	)
}
