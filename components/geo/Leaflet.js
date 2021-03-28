import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import Spinner from "./Spinner"

const DEBUG = true

const loadScript = ( scriptId, srcUrl, callback ) => {
	const existingScript = document.getElementById( 'scriptId' )
	if( !existingScript ) {
		const script = document.createElement( 'script' )
		script.src = srcUrl
		script.id = scriptId
		document.body.appendChild( script )
		script.onload = () => {
			if( callback ) {
				callback()
			}
		}
	}
	if( existingScript && callback ) callback()
}

export default function Leaflet( { lat, lng } ) {
	if( lat === 0 && lng === 0 ) return null
	const domRef = useRef()
	const mapRef = useRef()
	const [ loaded, set_loaded ] = useState( 0 )

	useEffect( () => {
		loadScript( 'leaflet-script', 'https://unpkg.com/leaflet/dist/leaflet.js', () => set_loaded( l => l + 1 ) )
	}, [] )

	useEffect( () => {
			if( loaded === 1 ) {
				loadScript( 'esti-script', 'https://unpkg.com/esri-leaflet/dist/esri-leaflet.js', () => set_loaded( l => l + 1 ) )
				return
			}
			if( loaded < 2 || !domRef.current ) return
			mapRef.current = window.L.map( 'map' ).setView( [ lat, lng ], 13 )
			window.L.esri.basemapLayer( "Topographic", { detectRetina: true } ).addTo( mapRef.current )
		},
		[ domRef.current, loaded ] )

	if( loaded < 2 ) return (
		<Spinner/>
	)

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
			`}</style>

		</div>
	)
}
