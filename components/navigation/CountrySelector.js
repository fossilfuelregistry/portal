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
	const didSetDefaultFromUrl = useRef()

	useEffect( () => {
		if( router.query.country && onChange && !didSetDefaultFromUrl.current ) {
			onChange( { value: router.query.country } )
			didSetDefaultFromUrl.current = true
		}
	}, [ router.query ] )

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_countries )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={loadingCountries} error={errorLoadingCountries}/>

	const countries = countriesData?.neCountries?.nodes ?? []

	return (
		<Select
			showSearch
			style={{ minWidth: 200, width: '100%' }}
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
