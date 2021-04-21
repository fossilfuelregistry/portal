import Globe from "react-globe.gl"
import { useQuery, gql } from "@apollo/client"
import Spinner from "./Spinner"
import { useCallback, useEffect, useRef, useState } from "react"

export default function GlobeNoSSR( { year, dataKeyName = 'production', onGlobeReady, onCountryClick } ) {

	const { data }
		= useQuery( gql`
		{ neCountries { nodes { 
			id geometry isoA2 name popEst
			countryProductionsByIso3166 { nodes { id year volume unit fossilFuelType sourceId } } 
			countryReservesByIso3166 { nodes { id year volume unit fossilFuelType sourceId grade } }
		} } } `, {} )

	const [ polygons, set_polygons ] = useState( [] )
	const [ duration, set_duration ] = useState( 3000 )
	const lastDataKeyName = useRef( dataKeyName )
	const lastYear = useRef( year )
	const countries = data?.neCountries?.nodes

	useEffect( () => {
		if( year !== lastYear.current || dataKeyName!== lastDataKeyName.current ) {
			set_duration( 400 )
			lastYear.current = year
			lastDataKeyName.current = dataKeyName
		}
	}, [ year, dataKeyName ] )

	useEffect( () => {
		if( countries?.length > 0 )
			set_polygons(
				countries
					.filter( c => c.ISO_A2 !== 'AQ' )
					.map( c => ( { ...c } ) )
			)
	}, [ countries ] )

	const handleCountryClick = useCallback( ( obj, event ) => {
		const _country = countries.find( c => c.isoA2 === obj?.isoA2 )
		onCountryClick( _country )
	}, [ countries ] )


	const getAltitude = useCallback( country => {
		let data
		switch( dataKeyName ) {
			case 'production':
				data = country.countryProductionsByIso3166?.nodes?.find( p => p.year === year )?.volume ?? 1
				return Math.sqrt( data ) / 250
			case 'reserves':
				data = country.countryReservesByIso3166?.nodes?.find( p => p.year === year )?.volume ?? 1
				return Math.sqrt( data ) / 50
			default:
				return 0
		}
	}, [ year, dataKeyName ] )

	if( polygons.length < 10 )
		return <Spinner/>

	return (
		<Globe
			width={window.innerWidth - 40}
			height={window.innerWidth - 40}
			backgroundColor="#ffffff"
			globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
			onGlobeReady={onGlobeReady}
			onPolygonClick={handleCountryClick}
			polygonsData={polygons}
			polygonAltitude={getAltitude}
			polygonCapColor={() => 'rgba(20, 0, 0, 0.5)'}
			polygonSideColor={() => 'rgba(0, 0, 0, 0.08)'}
			polygonsTransitionDuration={duration}
		/>
	)
}
