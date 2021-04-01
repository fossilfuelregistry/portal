import Globe from "react-globe.gl"
import { useQuery, gql } from "@apollo/client"
import Spinner from "./Spinner"
import { useCallback, useEffect, useRef, useState } from "react"


export default function GlobeNoSSR( { year } ) {

	const { data }
		= useQuery( gql`{ neCountries { nodes { isoA2 countryProductionsByIso3166 { nodes { production year id } } id geometry } } } `, {} )

	const [ polygons, set_polygons ] = useState( [] )
	const [ duration, set_duration ] = useState( 3000 )
	const lastYear = useRef( year )
	const countries = data?.neCountries?.nodes

	useEffect( () => {
		if( year !== lastYear.current ) {
			set_duration( 300 )
			lastYear.current = year
		}
	}, [ year ] )

	useEffect( () => {
		if( countries?.length > 0 )
			set_polygons(
				countries
					.filter( c => c.ISO_A2 !== 'AQ' )
					.map( c => ( { ...c } ) )
			)
	}, [ countries ] )

	const getAltitude = useCallback( country => {
		const production = country.countryProductionsByIso3166?.nodes?.find( p => p.year === year )?.production ?? 1
		return Math.sqrt( production ) / 250
	}, [ year ] )

	if( polygons.length < 10 )
		return <Spinner/>

	return (
		<Globe
			backgroundColor="#ffffff"
			globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
			polygonsData={polygons}
			polygonAltitude={getAltitude}
			polygonCapColor={() => 'rgba(20, 0, 0, 0.5)'}
			polygonSideColor={() => 'rgba(0, 0, 0, 0.08)'}
			polygonsTransitionDuration={duration}
		/>
	)
}
