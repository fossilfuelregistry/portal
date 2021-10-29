import { useEffect, useMemo, useRef, useState } from "react"
import bbox from '@turf/bbox'
import Loading from "../Loading"
import getConfig from "next/config"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const loadScript = ( scriptId, srcUrl, callback ) => {
	DEBUG && console.info( 'Maplibre::loadScript', { scriptId, srcUrl, callback } )
	const existingScript = document.getElementById( scriptId )
	if( !existingScript ) {
		const script = document.createElement( 'script' )
		script.src = srcUrl
		script.id = scriptId
		document.body.appendChild( script )

		const cssLink = document.createElement( 'link' )
		cssLink.href = 'https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css'
		cssLink.id = 'maplibrecss'
		cssLink.type = 'text/css'
		cssLink.rel = 'stylesheet'
		document.head.appendChild( cssLink )

		script.onload = arg => {
			if( callback ) {
				DEBUG && console.info( '<<< loaded', scriptId )
				callback()
			}
		}
	}
	if( existingScript && callback ) callback()
}

export default function MapLibre( {
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
	const map = useRef()
	const markers = useRef( [] )
	const highlightGroup = useRef()
	const [ loaded, set_loaded ] = useState( 0 )

	DEBUG && console.info( { center, onMove, onMap, className } )

	const features = useMemo( () => {
		const geo = projects
			.map( p => p?.geom?.geojson ?? p?.geoPosition?.geojson )

		return {
			type: 'FeatureCollection',
			features: geo
				.filter( p => !!p?.type && p.type !== 'Point' )
				.map( p => ( { type: 'Feature', geometry: p } ) )
		}
	}, [ projects ] )

	const projectMarkers = useMemo( () => {
		const geo = ( projects ?? [] ).map( p => p?.geom?.geojson ?? p?.geoPosition?.geojson )
		return geo
			.filter( p => p?.type === 'Point' )
			.map( p => p.coordinates )
	}, [ projects ] )

	useEffect( () => {
		loadScript( 'maplibre-script', 'https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.js', () => set_loaded( l => l + 1 ) )
	}, [] )

	useEffect( () => {
		DEBUG && console.info( 'MapLibre useEffect Create map', loaded, window.maplibregl, domRef.current, map.current )
		if( !window.maplibregl || !domRef.current || map.current ) return
		DEBUG && console.info( "CREATE MAP" )
		map.current = new window.maplibregl.Map( {
			container: domRef.current,
			style: `https://tiles.fossilfuelregistry.org/styles/basic-preview/style.json`,
		} )
		DEBUG && console.info( "NEW MAP", map.current )
		map.current.on( 'load', () => {
			map.current.resize()
			set_loaded( 2 )
		} )
	}, [ loaded, domRef.current ] )

	useEffect( () => {
		if( loaded < 2 || !outlineGeometry ) return
		const bounds = bbox( outlineGeometry )
		DEBUG && console.info( 'MapLibre add border', { loaded, outlineGeometry, bounds } )
		try {
			if( map.current.getSource( 'borders' ) ) {
				try {
					map.current.removeLayer( 'borders' )
					map.current.removeSource( 'borders' )
				} catch( e ) {
				}
			}

			map.current.addSource( 'borders', {
				type: "geojson",
				data: {
					type: "Feature",
					geometry: outlineGeometry
				}
			} )
			map.current.addLayer( {
				id: 'borders',
				type: 'line',
				source: 'borders',
				layout: {},
				paint: {
					'line-color': '#1172BA',
					'line-opacity': 0.5,
					'line-width': 3
				}
			} )
			DEBUG && console.info( 'fitBounds', bounds )
			map.current.fitBounds( bounds )
			set_loaded( 3 )
		} catch( e ) {
			console.info( e )
			console.info( { outlineGeometry } )
		}
	}, [ domRef.current, loaded, outlineGeometry ] )

	useEffect( () => {
		if( loaded < 3 ) return
		try {
			if( map.current.getSource( 'highlight' ) ) {
				map.current.removeLayer( 'highlight' )
				map.current.removeSource( 'highlight' )
			}

			if( !highlightedProjects?.[ 0 ]?.geojson ) return

			if( highlightedProjects[ 0 ].geojson.type === 'Point' ) {
				map.current.fitBounds( [ highlightedProjects[ 0 ].geojson.coordinates, highlightedProjects[ 0 ].geojson.coordinates ], { maxZoom: 11 } )
				//console.info( window.L.GeoJSON.coordsToLatLng( highlightedProjects[ 0 ].geojson.coordinates ) )
			} else {
				map.current.addSource( 'highlight', {
					type: "geojson",
					data: {
						type: "Feature",
						geometry: highlightedProjects[ 0 ].geojson
					}
				} )
				map.current.addLayer( {
					id: 'highlight',
					type: 'line',
					source: 'highlight',
					layout: {},
					paint: {
						'line-color': '#ff6200',
						'line-width': 4
					}
				} )
				const pBounds = bbox( highlightedProjects[ 0 ].geojson )
				map.current.fitBounds( pBounds, { maxZoom: 7 } )
			}
		} catch( e ) {
			console.info( e )
			console.info( { highlightedProjects } )
		}
	}, [ domRef.current, loaded, highlightedProjects ] )

	useEffect( () => {
		if( loaded !== 3 || !projects ) return
		DEBUG && console.info( 'MapLibre add projects', { loaded, projects } )

		try {
			DEBUG && console.info( 'add projects', features, markers )

			if( map.current.getSource( 'projects' ) ) {
				map.current.removeLayer( 'projects' )
				map.current.removeSource( 'projects' )
				markers.current.forEach( m => m.remove() )
				markers.current = []
			}

			map.current.addSource( 'projects', { type: "geojson", data: features } )
			map.current.addLayer( {
				id: 'projects',
				type: 'line',
				source: 'projects',
				layout: {},
				paint: {
					'line-color': '#1172BA',
					'line-width': 2
				}
			} )

			projectMarkers.forEach( m => {
				const marker = new window.maplibregl
					.Marker( { scale: 0.7, color: theme[ '@primary-color' ] } )
					.setLngLat( m )
					.addTo( map.current )
				markers.current.push( marker )
				marker.getElement().addEventListener( 'click', () => {
					window.location = 'https://maps.google.com/?t=k&q=' + m[ 1 ] + ',' + m[ 0 ]
				} )
			} )

			if( fitToProjects ) {
				let bounds = bbox( features )
				map.current.fitBounds( bounds, { maxZoom: 7 } )
			}
		} catch( e ) {
			console.info( e )
			console.info( { projects } )
		}
	}, [ domRef.current, loaded, projects, projectMarkers ] )

	if( typeof window === 'undefined' || !window.maplibregl ) return <Loading/>

	return (
		<div className={ className }>
			<div
				className="maplibre-wrap"
				id="map"
				ref={ el => domRef.current = el }
			/>
		</div>
	)
}
