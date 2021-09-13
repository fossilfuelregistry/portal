import Globe from "react-globe.gl"
import Spinner from "./Spinner"
import { useCallback, useEffect, useRef, useState } from "react"
import { notification } from "antd"

export default function GlobeNoSSR( { year, dataKeyName = 'production', onGlobeReady, onCountryClick } ) {
	const [ countries, set_countries ] = useState()
	const [ polygons, set_polygons ] = useState( [] )
	const [ duration, set_duration ] = useState( 3000 )
	const lastDataKeyName = useRef( dataKeyName )
	const lastYear = useRef( year )

	useEffect( () => {
		const asyncEffect = async() => {
			try {
				const f = await fetch( '/index-globe-1.json' )
				if( !f.ok ) throw new Error( 'Status ' + f.status + ' ' + f.statusText )
				const data = await f.json()
				set_countries( data )
				//console.log( data.find( d => d.isoA2 === 'GB' ) )
			} catch( e ) {
				notification.error( {
					message: "Failed to fetch global dataset.",
					description: e.message
				} )
			}
		}
		asyncEffect()
	}, [] )

	useEffect( () => {
		if( year !== lastYear.current || dataKeyName !== lastDataKeyName.current ) {
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
			width={ window.innerWidth - 40 }
			height={ Math.min( window.innerWidth - 40, window.innerHeight - 100 ) }
			backgroundColor="#ffffff"
			globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
			onGlobeReady={ onGlobeReady }
			onPolygonClick={ handleCountryClick }
			polygonsData={ polygons }
			polygonAltitude={ getAltitude }
			polygonCapColor={ () => 'rgba(20, 0, 0, 0.5)' }
			polygonSideColor={ () => 'rgba(0, 0, 0, 0.08)' }
			polygonsTransitionDuration={ duration }
		/>
	)
}
