import Globe from "react-globe.gl"
import Spinner from "./Spinner"
import { useCallback, useEffect, useState } from "react"
import { notification } from "antd"

export default function GlobeNoSSR( { year, dataKeyName = 'production', onGlobeReady, onCountryClick } ) {
	const [ countries, set_countries ] = useState()
	const [ polygons, set_polygons ] = useState( [] )

	useEffect( () => {
		const asyncEffect = async() => {
			try {
				const f = await fetch( '/index-globe-1.json' )
				if( !f.ok ) throw new Error( 'Status ' + f.status + ' ' + f.statusText )
				const data = await f.json()
				set_countries( data )
				//console.info( data.find( d => d.isoA2 === 'GB' ) )
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
		if( countries?.length > 0 )
			set_polygons(
				countries
					.map( c => ( { ...c, geometry: c.g } ) )
					.filter( c => c.geometry?.type !== undefined )
			)
	}, [ countries?.length ] )

	const getAltitude = useCallback( country => {
		return Math.sqrt( country.t ) / 250
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
			onPolygonClick={ onCountryClick }
			polygonsData={ polygons }
			polygonAltitude={ getAltitude }
			polygonCapColor={ () => 'rgba(20, 0, 0, 0.5)' }
			polygonSideColor={ () => 'rgba(0, 0, 0, 0.08)' }
			polygonsTransitionDuration={ 3000 }
		/>
	)
}
