import React, { useEffect, useRef, useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import Footer from "components/Footer"
//import { Map } from 'maplibre-gl'
//import dynamic from 'next/dynamic'

const DEBUG = true

const loadScript = ( scriptId, srcUrl, callback ) => {
	DEBUG && console.log( 'Maplibre::loadScript', { scriptId, srcUrl, callback } )
	const existingScript = document.getElementById( 'scriptId' )
	if( !existingScript ) {
		const script = document.createElement( 'script' )
		script.src = srcUrl
		script.id = scriptId
		DEBUG && console.log( '...', scriptId )
		document.body.appendChild( script )

		const cssLink = document.createElement( 'link' )
		cssLink.src = 'https://cdn.skypack.dev/maplibre-gl/dist/maplibre-gl.css'
		document.head.appendChild( cssLink )

		script.onload = arg => {
			if( callback ) {
				DEBUG && console.log( '<<< loaded', scriptId )
				callback()
			}
		}
	}
	if( existingScript && callback ) callback()
}

export default function MapPage() {
	const map = useRef()
	const domRef = useRef()
	const [ loaded, set_loaded ] = useState( 0 )

	useEffect( () => {
		loadScript( 'maplibre-script', 'https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.js', () => set_loaded( l => l + 1 ) )
	}, [] )

	useEffect( () => {
		console.log( loaded, window.maplibregl, domRef.current )
		if( !window.maplibregl || !domRef.current || map.current ) return
		console.log( "CREATE MAP" )
		map.current = new window.maplibregl.Map( {
			container: domRef.current,
			style: `https://tiles.fossilfuelregistry.org/styles/basic-preview/style.json`,
			center: [ 18.184216, 59.316269 ],
			zoom: 8
		} )
		console.log( "NEW MAP", map.current )
	}, [ loaded, domRef.current ] )

	if( typeof window === 'undefined' || !window.maplibregl ) return "Not loaded."
	console.log( 'RENDER', window.maplibregl )
	return (
		<div className="page">
			<TopNavigation/>

			<div className="page-padding">
				<div style={ { position: "relative", height: 700 } }>
					<div id="map" ref={ el => domRef.current = el } style={ { width: 800, height: 600 } }/>
				</div>
			</div>

			<Footer/>

			<style jsx>{ `
              #map {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 100%;
              }
			` }
			</style>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
