import { useQuery } from "@apollo/client"
import { GQL_countries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import useText from "lib/useText";
import useTracker from "lib/useTracker";

export default function CountrySelector() {
	const router = useRouter()
	const [ value, set_value ] = useState()
	const dispatch = useDispatch()
	const { getText } = useText()
	const { trackEvent } = useTracker()

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_countries )

	const countries = useMemo( () =>
		( countriesData?.getProducingCountries?.nodes ?? [] )
			.filter( c => c.name !== null )
			.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
	[ countriesData?.getProducingCountries?.nodes?.length ] )

	useEffect( () => {
		if( !countries.length ) return
		const { country } = router.query
		if( country && ( !value || value.value !== country ) ) {
			const name = countries.find( c => c.isoA2.toLowerCase() === country.toLowerCase() )?.[ 'name' ]
			const v = { value: router.query.country, label: name }

			dispatch( { type: 'COUNTRY', payload: v } )
			set_value( v )
			trackEvent( 'country', v )
		}
	}, [ router.query.country, countries?.length ] )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={ loadingCountries } error={ errorLoadingCountries }/>

	return (
		<Select
			showSearch
			style={ { minWidth: 120, width: '100%' } }
			value={ value }
			labelInValue={ true }
			placeholder={ getText( 'country' ) + '...' }
			optionFilterProp="children"
			onChange={ async v => {
				set_value( v )
				dispatch( { type: 'COUNTRY', payload: v } )
				await router.replace( {
					pathname: router.pathname,
					query: { ...router.query, country: v.value }
				} )
			} }
			filterOption={ ( input, option ) =>
				option.children?.toLowerCase().indexOf( input?.toLowerCase() ) >= 0
			}
		>
			{ countries.map( c => ( <Select.Option key={ c.isoA2?.toLowerCase() }>{ c.name }</Select.Option> ) ) }
		</Select>
	)
}
