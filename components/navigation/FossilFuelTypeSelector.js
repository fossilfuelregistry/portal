import { useQuery } from "@apollo/client"
import { GQL_fossilFuelTypes } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { textsSelector, useStore } from "lib/zustandProvider"
import { Select } from "antd"

export default function FossilFuelTypeSelector( { onChange } ) {

	const texts = useStore( textsSelector )
	const { data: fftData, loading: loadingFft, error: errorLoadingFft }
		= useQuery( GQL_fossilFuelTypes )

	if( loadingFft || errorLoadingFft )
		return <GraphQLStatus loading={loadingFft} error={errorLoadingFft}/>

	const fossilFuelTypes = fftData?.fossilFuelTypes?.nodes ?? []

	return (
		<Select
			showSearch
			style={{ minWidth: 200, width: '100%' }}
			placeholder={texts?.fossil_fuel_type + '...'}
			optionFilterProp="children"
			onChange={onChange}
			filterOption={( input, option ) =>
				option.children?.toLowerCase().indexOf( input?.toLowerCase() ) >= 0
			}
		>
			{fossilFuelTypes.map( c => ( <Select.Option key={c}>{texts?.[ c ]}</Select.Option> ) )}
		</Select>
	)
}
