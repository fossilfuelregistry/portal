import { useQuery } from "@apollo/client"
import { GQL_productionCountries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import useText from "lib/useText"
import useTracker from "lib/useTracker"

const DEBUG = false

export default function CountrySelector() {
	const router = useRouter()
	const language = useSelector( redux => redux.language )
	const [ selectedCountryOption, set_selectedCountryOption ] = useState()
	const [ selectedRegionOption, set_selectedRegionOption ] = useState()
	const [ regions, set_regions ] = useState()
	const dispatch = useDispatch()
	const { getText } = useText()
	const { trackEvent } = useTracker()

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_productionCountries )

	const countries = useMemo( () => {
		DEBUG && console.log( 'CountrySelector', { language, countries: countriesData?.getProducingIso3166?.nodes } )
		return ( countriesData?.getProducingIso3166?.nodes ?? [] )
			.map( c => ( { ...c, name: c[ language ] ?? c.en } ) )
			.filter( c => c.name !== null && c.iso31662 === '' ) // Exclude regions
			.sort( ( a, b ) => a.name.localeCompare( b.name ) )
	}, [ countriesData?.getProducingIso3166?.nodes?.length, language ] )

	DEBUG && console.log( countries.length, countriesData?.getProducingIso3166?.nodes?.length, language )

	// Preload based on URL value

	useEffect( () => {
		if( !countries.length ) return
		const { country } = router.query
		if( country && ( !selectedCountryOption || selectedCountryOption.value !== country ) ) {
			const name = countries.find( c => c.iso3166.toLowerCase() === country.toLowerCase() )?.[ 'name' ]
			const newselectedCountryOption = { value: router.query.country, label: name }

			dispatch( { type: 'COUNTRY', payload: newselectedCountryOption.value } )
			set_selectedCountryOption( newselectedCountryOption )
			trackEvent( 'country', newselectedCountryOption.value )

			// Look for regions in the country

			const _regions = ( countriesData?.getProducingIso3166?.nodes ?? [] )
				.filter( r => r.iso3166 === country && !!r.iso31662 )
				.map( r => ( { ...r, name: r[ language ] ?? r.en } ) )
			set_regions( _regions )
		}
	}, [ router.query.country, countries?.length, selectedCountryOption?.value ] )

	DEBUG && console.log( 'CountrySelector', { countries, regions } )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={ loadingCountries } error={ errorLoadingCountries }/>

	return (
		<>
			<Select
				showSearch
				style={ { minWidth: 120, width: '100%' } }
				value={ selectedCountryOption }
				labelInValue={ true }
				placeholder={ getText( 'country' ) + '...' }
				optionFilterProp="children"
				onChange={ async v => {
					set_selectedCountryOption( v )
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

			{ regions?.length > 0 &&
			<div style={{ marginTop: 12 }}>
				<Select
					showSearch
					style={ { minWidth: 120, width: '100%' } }
					value={ selectedRegionOption }
					labelInValue={ true }
					allowClear={ true }
					placeholder={ getText( 'region' ) + '...' }
					optionFilterProp="children"
					onChange={ async r => {
						set_selectedRegionOption( r )
						dispatch( { type: 'REGION', payload: r?.value } )
						const query = { ...router.query }
						delete query.region
						if( r?.value ) query.region = r.value
						await router.replace( { pathname: router.pathname, query } )
					} }
				>
					{ regions.map( r => (
						<Select.Option key={ r.iso31662?.toLowerCase() }>{ r.name ?? r.iso31662 }</Select.Option> ) ) }
				</Select>
			</div>
			}
		</>
	)
}
