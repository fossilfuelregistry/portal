import { useQuery } from "@apollo/client"
import { GQL_countries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { textsSelector, useStore } from "../../lib/zustandProvider"
import { Select } from "antd"

export default function CountrySelector( { onChange } ) {

	const texts = useStore( textsSelector )
	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_countries )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={loadingCountries} error={errorLoadingCountries}/>

	const countries = countriesData?.neCountries?.nodes ?? []

	return (
		<Select
			showSearch
			style={{ minWidth: 200, width: '100%' }}
			placeholder={texts?.country + '...'}
			optionFilterProp="children"
			onChange={onChange}
			filterOption={( input, option ) =>
				option.children?.toLowerCase().indexOf( input?.toLowerCase() ) >= 0
			}
		>
			{countries.map( c => ( <Select.Option key={c.isoA2}>{c.name}</Select.Option> ) )}
		</Select>
	)
}
