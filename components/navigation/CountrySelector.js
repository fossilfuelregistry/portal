import { useQuery } from "@apollo/client"
import { GQL_productionCountries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import useText from "lib/useText"
import useTracker from "lib/useTracker"

const DEBUG = true

export default function CountrySelector() {
	const router = useRouter()
	const language = useSelector( redux => redux.language )
	const [ selectedOption, set_selectedOption ] = useState()
	const dispatch = useDispatch()
	const { getText } = useText()
	const { trackEvent } = useTracker()

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_productionCountries )

	const countries = useMemo( () => {
		DEBUG && console.log( 'CountrySelector', { language } )
		return ( countriesData?.getProducingIso3166?.nodes ?? [] )
			.map( c => ( { ...c, name: c[ language ] ?? c.en } ) )
			.filter( c => c.name !== null )
			.sort( ( a, b ) => a.name.localeCompare( b.name ) )
	}, [ countriesData?.getProducingIso3166?.nodes?.length, language ] )

	useEffect( () => {
		if( !countries.length ) return
		const { country } = router.query
		if( country && ( !selectedOption || selectedOption.value !== country ) ) {
			const name = countries.find( c => c.iso3166.toLowerCase() === country.toLowerCase() )?.[ 'name' ]
			const newSelectedOption = { value: router.query.country, label: name }

			dispatch( { type: 'COUNTRY', payload: newSelectedOption.value } )
			set_selectedOption( newSelectedOption )
			trackEvent( 'country', newSelectedOption.value )
		}
	}, [ router.query.country, countries?.length, selectedOption?.value ] )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={ loadingCountries } error={ errorLoadingCountries }/>

	return (
		<Select
			showSearch
			style={ { minWidth: 120, width: '100%' } }
			value={ selectedOption }
			labelInValue={ true }
			placeholder={ getText( 'country' ) + '...' }
			optionFilterProp="children"
			onChange={ async v => {
				set_selectedOption( v )
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
			{ countries.map( c => ( <Select.Option key={ c.iso3166?.toLowerCase() }>{ c.name }</Select.Option> ) ) }
		</Select>
	)
}
