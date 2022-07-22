import Globe from "react-globe.gl"
import Spinner from "./Spinner"
import React, { useCallback, useEffect, useState } from "react"
import { notification } from "antd"
import { useRouter } from "next/router"
import { withParentSize } from '@visx/responsive'
import * as Sentry from "@sentry/nextjs"

export default withParentSize(
	function GlobeNoSSR( { year, dataKeyName = 'production', onGlobeReady, onCountryClick, parentWidth, parentHeight } ) {
		const [ countries, set_countries ] = useState()
		const [ polygons, set_polygons ] = useState( [] )
		const router = useRouter()

		useEffect( () => {
			const asyncEffect = async() => {
				try {
					const f = await fetch( '/index-globe-1.json' )
					if( !f.ok ) throw new Error( 'Status ' + f.status + ' ' + f.statusText )
					const data = await f.json()
					set_countries( data )
					//console.info( data.find( d => d.isoA2 === 'GB' ) )
				} catch( e ) {
					Sentry.captureException( e )
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
				width={ parentWidth }
				height={ parentHeight }
				backgroundColor="#ffffff"
				globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
				onGlobeReady={ onGlobeReady }
				onPolygonClick={ onCountryClick }
				polygonsData={ polygons }
				polygonAltitude={ getAltitude }
				polygonLabel={ country => country[ router.locale ] }
				polygonCapColor={ () => 'rgba(20, 0, 0, 0.5)' }
				polygonSideColor={ () => 'rgba(0, 0, 0, 0.08)' }
				polygonsTransitionDuration={ 3000 }
			/>
		)
	}
)