import { useQuery } from "@apollo/client"
import { GQL_countries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { textsSelector, useStore } from "lib/zustandProvider"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useRef } from "react"

export default function CountrySelector( { onChange } ) {
	const router = useRouter()
	const texts = useStore( textsSelector )
	const didSetDefaultFromUrl = useRef( false )

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_countries )

	const countries = countriesData?.neCountries?.nodes ?? []

	useEffect( () => {
		if( !countries.length ) return
		const { country } = router.query
		if( country && onChange && !didSetDefaultFromUrl.current ) {
			const name = countries.find( c => c.isoA2.toLowerCase() === country.toLowerCase() )?.[ 'name' ]
			onChange(
				{ value: router.query.country },
				{ children: name }
			)
			didSetDefaultFromUrl.current = true
		}
	}, [ router.query, countries ] )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={loadingCountries} error={errorLoadingCountries}/>

	return (
		<Select
			showSearch
			style={{ minWidth: 120, width: '100%' }}
			defaultValue={router.query.country ? { value: router.query.country } : undefined}
			labelInValue={true}
			placeholder={texts?.country + '...'}
			optionFilterProp="children"
			onChange={onChange}
			filterOption={( input, option ) =>
				option.children?.toLowerCase().indexOf( input?.toLowerCase() ) >= 0
			}
		>
			{countries.map( c => ( <Select.Option key={c.isoA2?.toLowerCase()}>{c.name}</Select.Option> ) )}
		</Select>
	)
}
