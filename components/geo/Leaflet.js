import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import Spinner from "./Spinner"

const DEBUG = false

const projectBorderStyle = { "color": "#2b8d6e", "weight": 3, "opacity": 0.65 }

const loadScript = ( scriptId, srcUrl, callback ) => {
	DEBUG && console.log( 'Leaflet::loadScript', { scriptId, srcUrl, callback } )
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

export default function Leaflet( {
	center,
	onMove,
	onMap,
	className,
	outlineGeometry,
	projects,
	highlightedProjects,
	fitToProjects
} ) {
	const domRef = useRef()
	const mapRef = useRef()
	const outlineLayer = useRef()
	const markerLayer = useRef()
	const projectLayer = useRef()
	const highlightGroup = useRef()
	const [ loaded, set_loaded ] = useState( 0 )

	DEBUG && console.log( { center, onMove, onMap, className } )

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

				mapRef.current = window.L.map( 'map' ).setView( [ center.lat, center.lng ], 12 )

				window.L.tileLayer(
					'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
					{ attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' }
				).addTo( mapRef.current )

				mapRef.current.on( 'moveend', event => {
					DEBUG && console.log( { event, center: mapRef.current.getCenter() } )
					onMove?.( mapRef.current.getCenter(), mapRef.current.getBounds() )
				} )

				markerLayer.current = window.L.layerGroup().addTo( mapRef.current )
				highlightGroup.current = window.L.layerGroup().addTo( mapRef.current )
				projectLayer.current = window.L.geoJSON( undefined, { style: projectBorderStyle } ).addTo( mapRef.current )

				// FIX leaflet's default icon path problems with webpack
				delete window.L.Icon.Default.prototype._getIconUrl
				window.L.Icon.Default.mergeOptions( {
					iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
					iconUrl: '/leaflet/images/marker-icon.png',
					shadowUrl: '/leaflet/images/marker-shadow.png'
				} )

				onMap?.( mapRef.current )
				return
			default:
		}
	}, [ domRef.current, loaded ] )

	useEffect( () => {
		if( loaded < 3 || !outlineGeometry ) return

		try {
			if( outlineLayer.current ) {
				outlineLayer.current.removeFrom( mapRef.current )
			}
			outlineLayer.current = window.L.GeoJSON.geometryToLayer( outlineGeometry )
			outlineLayer.current.addTo( mapRef.current )
			const bounds = outlineLayer.current.getBounds()
			DEBUG && console.log( 'FIT!', outlineGeometry, bounds.isValid() )
			DEBUG && console.log( JSON.stringify( bounds ) )
			DEBUG && console.log( bounds )
			mapRef.current.fitBounds( bounds, { maxZoom: 6 } )
			DEBUG && console.log( 'FITTED' )
		} catch( e ) {
			console.log( e )
			console.log( { outlineGeometry } )
		}
	}, [ domRef.current, loaded, outlineGeometry ] )

	useEffect( () => {
		if( loaded < 3 ) return
		try {
			highlightGroup.current?.clearLayers()
			if( !highlightedProjects?.[ 0 ]?.geojson ) return

			const highlight = window.L.GeoJSON.geometryToLayer( highlightedProjects[ 0 ].geojson )
			highlightGroup.current.addLayer( highlight )
			const bounds = highlight.getBounds()

			console.log( 'HIGHLIGHT', { highlightGroup, highlightedProjects, bounds } )
			mapRef.current.fitBounds( bounds, { maxZoom: 7 } )
		} catch( e ) {
			console.log( e )
			console.log( { highlightedProjects } )
		}
	}, [ domRef.current, loaded, highlightedProjects ] )

	useEffect( () => {
		if( loaded < 3 || !projects ) return
		try {
			projectLayer.current.clearLayers()

			projects?.map( p => {
				if( p?.geom?.geojson )
					projectLayer.current.addData( p.geom?.geojson )
				else if( p?.geoPosition?.geojson )
					projectLayer.current.addData( p.geoPosition?.geojson )
			} )

			if( fitToProjects ) {
				const bounds = projectLayer.current.getBounds()
				mapRef.current.fitBounds( bounds, { maxZoom: 6 } )
			}
		} catch( e ) {
			console.log( e )
			console.log( { projects } )
		}
	}, [ domRef.current, loaded, projects ] )

	if( loaded < 3 ) return <Spinner/>

	return (
		<div className={ className }>
			<Head>
				{/* Load Leaflet CSS from CDN */ }
				<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
			</Head>

			<div
				className="leaflet-wrap"
				id="map"
				ref={ domRef }
			/>
		</div>
	)
}
