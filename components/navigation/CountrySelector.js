import { useQuery } from "@apollo/client"
import { GQL_countries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function CountrySelector( { onChange } ) {
	const router = useRouter()
	const [ value, set_value ] = useState()
	const texts = useSelector( redux => redux.texts )

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_countries )

	const countries = countriesData?.neCountries?.nodes ?? []

	useEffect( () => {
		console.log( { q: router.query, countries } )
		if( !countries.length ) return
		const { country } = router.query
		if( country && !value ) {
			const name = countries.find( c => c.isoA2.toLowerCase() === country.toLowerCase() )?.[ 'name' ]
			const v = { value: router.query.country }
			onChange?.( v, { children: name } )
			set_value( v )
		}
	}, [ router.query.country, countries?.length ] )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={loadingCountries} error={errorLoadingCountries}/>

	return (
		<Select
			showSearch
			style={{ minWidth: 120, width: '100%' }}
			value={value}
			labelInValue={true}
			placeholder={texts?.country + '...'}
			optionFilterProp="children"
			onChange={v => {
				set_value( v )
				onChange?.( v )
			}}
			filterOption={( input, option ) =>
				option.children?.toLowerCase().indexOf( input?.toLowerCase() ) >= 0
			}
		>
			{countries.map( c => ( <Select.Option key={c.isoA2?.toLowerCase()}>{c.name}</Select.Option> ) )}
		</Select>
	)
}
