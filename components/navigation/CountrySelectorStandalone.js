import React, { useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import { GQL_productionCountries } from "queries/general"
import GraphQLStatus from "../GraphQLStatus"
import { Select } from "antd"
import { useRouter } from "next/router"
import useText from "lib/useText"

const DEBUG = false

export default function CountrySelectorStandalone( { onChange } ) {
	const router = useRouter()
	const [ selectedCountryOption, set_selectedCountryOption ] = useState()
	const { getText } = useText()

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_productionCountries )

	const countries = useMemo( () => {
		DEBUG && console.info( 'CountrySelector useMemo', {
			language: router.locale,
			countries: countriesData?.getProducingIso3166?.nodes
		} )
		return ( countriesData?.getProducingIso3166?.nodes ?? [] )
			.map( c => ( { ...c, name: c[ router.locale ] ?? c.en } ) )
			.filter( c => c.name !== null && c.iso31662 === '' ) // Exclude regions
			.sort( ( a, b ) => a.name.localeCompare( b.name ) )
	}, [ countriesData?.getProducingIso3166?.nodes?.length, router.locale ] )

	DEBUG && console.info( 'CountrySelector', { countries, selectedCountryOption } )

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
				allowClear={true}
				onChange={ c => {
					set_selectedCountryOption( c )
					onChange?.( c )
				} }
				filterOption={ ( input, option ) =>
					option.children?.toLowerCase().indexOf( input?.toLowerCase() ) >= 0
				}
			>
				{ countries.map( c => ( <Select.Option key={ c.iso3166?.toLowerCase() }>{ c.name }</Select.Option> ) ) }
			</Select>
		</>
	)
}
