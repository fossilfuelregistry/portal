import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import Spinner from "./Spinner"

const DEBUG = false

const loadScript = ( scriptId, srcUrl, callback ) => {
	const existingScript = document.getElementById( 'scriptId' )
	if( !existingScript ) {
		const script = document.createElement( 'script' )
		script.src = srcUrl
		script.id = scriptId
		DEBUG && console.log( '...', scriptId )
		document.body.appendChild( script )
		script.onload = () => {
			if( callback ) {
				DEBUG && console.log( '<<<', scriptId )
				callback()
			}
		}
	}
	if( existingScript && callback ) callback()
}

export default function Leaflet( { center, onMove, onMap } ) {
	const domRef = useRef()
	const mapRef = useRef()
	const [ loaded, set_loaded ] = useState( 0 )

	useEffect( () => {
		loadScript( 'leaflet-script', 'https://unpkg.com/leaflet/dist/leaflet.js', () => set_loaded( l => l + 1 ) )
	}, [] )

	useEffect( () => {
		DEBUG && console.log( { loaded } )
		switch( loaded ) {
			case 1:
				loadScript( 'leaflet-providers', '/js/leaflet-providers.js', () => set_loaded( l => l + 1 ) )
				return
			case 2:
				loadScript( 'leaflet-heat', '/js/leaflet-heat.js', () => set_loaded( l => l + 1 ) )
				return
			case 3:
				if( !domRef.current || typeof mapRef.current === 'object' ) return

				mapRef.current = window.L.map( 'map' ).setView( [ /*center.lat, center.lng*/ 55.008553008410345,  -121.55560433864595 ], 12 )

				window.L.tileLayer(
					'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
					{ attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' }
				).addTo( mapRef.current )


				mapRef.current.on( 'moveend', event => {
					DEBUG && console.log( { event, center: mapRef.current.getCenter() } )
					onMove?.( mapRef.current.getCenter(), mapRef.current.getBounds() )
				} )

				onMap?.( mapRef.current )
				return
			default:
		}
	},
	[ domRef.current, loaded ] )

	if( center?.lat === 0 && center?.lng === 0 ) return null

	if( loaded < 3 ) return <Spinner/>

	return (
		<div className="gffr-map">
			<Head>
				{/* Load Leaflet CSS from CDN */}
				<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
			</Head>

			<div className="leaflet-wrap" id="map" ref={domRef}/>

			<style jsx>{`
              .gffr-map .leaflet-wrap {
                width: 100vw;
                height: 80vh;
              }
			`}
			</style>

		</div>
	)
}
