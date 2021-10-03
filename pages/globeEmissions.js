import React, { useEffect, useState } from "react"
import { gql, useApolloClient, useQuery } from "@apollo/client"
import { GQL_productionCountries } from "../queries/general"
import GraphQLStatus from "../components/GraphQLStatus"
import settings from "../settings"
import { useConversionHooks } from "../components/viz/conversionHooks"

export default function MapPage() {
	const apolloClient = useApolloClient()
	const [ loading, set_loading ] = useState( false )
	const [ countries, set_countries ] = useState( [] )
	const [ fullCountries, set_fullCountries ] = useState( [] )
	const { co2FromVolume } = useConversionHooks()

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_productionCountries )

	useEffect( () => {
		const all = countriesData?.getProducingIso3166?.nodes // ?.filter( c => c.iso3166 === 'dk' || c.iso3166 === 'gb' )
		if( !( all?.length > 0 ) ) return
		set_countries( all )
	}, [ countriesData?.getProducingIso3166?.nodes?.length ] )

	useEffect( () => {
		console.log( '? PROD' )
		if( !countries?.length ) return
		console.log( 'PROD' )
		const asyncEffect = async() => {
			const allCountries = []

			try {
				for( let country of countries ) {
					const api = await apolloClient.query( {
						query: gql`query prod($iso3166: String!) {
							countryDataPoints(
								orderBy: [YEAR_ASC, FOSSIL_FUEL_TYPE_ASC, SOURCE_ID_ASC]
								condition: {
								  iso3166: $iso3166
								  iso31662: ""
								  dataType: PRODUCTION
								  sourceId: 2
								} ) 
							  	{ nodes { fossilFuelType volume year unit subtype sourceId quality } } }`,
						variables: { iso3166: country.iso3166 }
					} )
					const production = api?.data?.countryDataPoints?.nodes ?? []

					const api2 = await apolloClient.query( {
						query: gql`query prod($iso3166: String!) { neCountries(condition: {isoA2:$iso3166}) { nodes { geometry { geojson } } } }`,
						variables: { iso3166: country.iso3166.toUpperCase() }
					} )
					const geo = api2?.data?.neCountries?.nodes?.[ 0 ]?.geometry?.geojson

					// Available years

					const reduced = {}
					settings.supportedFuels.forEach( fuel => reduced[ fuel ] = {
						firstYear: settings.year.end,
						lastYear: 0
					} )

					const limits = production.reduce( ( _limits, datapoint ) => {
						const l = _limits[ datapoint.fossilFuelType ]
						l.firstYear = Math.min( l.firstYear, datapoint.year )
						l.lastYear = Math.max( l.lastYear, datapoint.year )
						return _limits
					}, reduced )

					// limits: {
					//   oil: {firstYear: 1980, lastYear: 2020},
					//   gas: {firstYear: 1983, lastYear: 2018},
					//   coal: {firstYear: 2040, lastYear: 0}
					//  }

					const year = Math.min( limits.oil?.lastYear, limits.gas?.lastYear )
					if( !( year > 2010 ) ) continue
					let totalCO2 = 0
					const prod = Object.keys( limits ).map( fuel => {
						let v = 0, u
						production.forEach( p => {
							if( p.fossilFuelType !== fuel ) return
							if( p.year !== year ) return
							u = p.unit
							v += p.volume
							const t = co2FromVolume( p )
							totalCO2 += t.scope1[ 1 ]
							totalCO2 += t.scope3[ 1 ]
						} )
						return { f: fuel, v, u }
					} )

					console.info( 'YEARS', production?.length, { production, limits } )
					let c = {
						...country,
						//l: limits,
						y: year,
						p: prod,
						t: totalCO2,
						g: geo
					}
					delete c.__typename
					delete c.iso31662

					allCountries.push( c )
				}
			} catch( e ) {
				console.log( e )
			}
			set_fullCountries( allCountries )
		}
		asyncEffect()
	}, [ countries?.length ] )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={ loadingCountries || loading } error={ errorLoadingCountries }/>

	return (
		<div className="page">

			<div className="page-padding">
				<pre>
					{ fullCountries?.map( c => (
						<div key={ c.iso3166 }>{ JSON.stringify( c ) },</div> ) ) }
				</pre>

			</div>

			<style jsx>{ `
			` }
			</style>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
