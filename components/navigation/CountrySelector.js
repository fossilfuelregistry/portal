import { useQuery } from "@apollo/client"
import { GQL_productionCountries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"
import useText from "lib/useText"
import useTracker from "lib/useTracker"
import { co2PageUpdateQuery } from "../CO2Forecast/calculate"

const DEBUG = true

export default function CountrySelector() {
	const router = useRouter()
	const store = useStore()
	const country = useSelector( redux => redux.country )
	const countryName = useSelector( redux => redux.countryName )
	const [ selectedCountryOption, set_selectedCountryOption ] = useState()
	const [ selectedRegionOption, set_selectedRegionOption ] = useState()
	const [ regions, set_regions ] = useState()
	const dispatch = useDispatch()
	const { getText } = useText()
	const { trackEvent } = useTracker()

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_productionCountries )

	DEBUG && console.info( '------CountrySelector------' )

	const countries = useMemo( () => {
		DEBUG && console.info( 'CountrySelector useMemo', {
			language: router.locale,
			countries: countriesData?.getProducingIso3166?.nodes
		} )
		const cs = ( countriesData?.getProducingIso3166?.nodes ?? [] )
			.map( c => ( { ...c, name: c[ router.locale ] ?? c.en } ) )
			.filter( c => c.name !== null && c.iso31662 === '' ) // Exclude regions
			.sort( ( a, b ) => a.name.localeCompare( b.name ) )

		DEBUG && console.info( 'CountrySelector Initialize', cs )
		return cs

	}, [ countriesData?.getProducingIso3166?.nodes?.length, router.locale ] )

	DEBUG && console.info( '\n', countries.length, countriesData?.getProducingIso3166?.nodes?.length )

	useEffect( () => { // Preload based on URL value which is initialized in Redux state
		if( !countries.length ) return
		if( !country || country === '-' || country === 'null' ) return
		DEBUG && console.info( 'CountrySelector useEffect COUNTRYNAME', country, router.query?.country )

		if( !selectedCountryOption || selectedCountryOption.value !== country ) {
			const name = countries.find( c => c.iso3166?.toLowerCase() === country.toLowerCase() )?.[ 'name' ]
			const newselectedCountryOption = { value: country, label: name }

			set_selectedCountryOption( newselectedCountryOption )
			dispatch( { type: 'COUNTRYNAME', payload: name } )
			trackEvent( 'country', { iso3166: newselectedCountryOption.value, country: name } )
		}
	}, [ countries?.length ] )

	useEffect( () => {
		if( !country ) return

		if( countries.length > 0 && !( countryName?.length > 0 ) ) {
			const currentCountry = countries.find( c => c.iso3166 = country )
			DEBUG && console.info( 'CountrySelector reInitialize', country, currentCountry, countries )
			dispatch( { type: 'COUNTRYNAME', payload: currentCountry?.name } )
		}

		// Look for regions in the country
		DEBUG && console.info( 'CountrySelector useEffect REGION', router.query?.country )
		const _regions = ( countriesData?.getProducingIso3166?.nodes ?? [] )
			.filter( r => r.iso3166 === country && !!r.iso31662 )
			.map( r => ( { ...r, name: r[ router.locale ] ?? r.en } ) )
		set_regions( _regions )
		if( _regions.length === 0 ) set_selectedRegionOption( undefined )
	}, [ country ] )

	DEBUG && console.info( 'CountrySelector', { countries, regions, selectedCountryOption } )

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
					set_selectedRegionOption( undefined )
					dispatch( { type: 'COUNTRY', payload: v.value } )
					dispatch( { type: 'COUNTRYNAME', payload: v.label } )
					dispatch( { type: 'REGION', payload: undefined } )
					dispatch( { type: 'PROJECT', payload: undefined } )
					dispatch( { type: 'PRODUCTIONSOURCEID', payload: undefined } )
					dispatch( { type: 'RESERVESSOURCEID', payload: undefined } )
					dispatch( { type: 'PROJECTIONSOURCEID', payload: undefined } )
					dispatch( { type: 'STABLEPRODUCTION', payload: undefined } )
					await co2PageUpdateQuery( store, router, {
						project: undefined,
						region: undefined,
						productionSourceId: undefined,
						reservesSourceId: undefined,
						projectionSourceId: undefined,
						country: v?.value
					} )
				} }
				filterOption={ ( input, option ) =>
					option.children?.toLowerCase().indexOf( input?.toLowerCase() ) >= 0
				}
			>
				{ countries.map( c => ( <Select.Option key={ c.iso3166?.toLowerCase() }>{ c.name }</Select.Option> ) ) }
			</Select>

			{ regions?.length > 0 &&
			<div style={ { marginTop: 12 } }>
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
						dispatch( { type: 'PROJECT', payload: undefined } )
						await co2PageUpdateQuery( store, router, {
							project: undefined,
							region: r?.value
						} )
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
