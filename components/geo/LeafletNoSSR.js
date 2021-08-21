import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from 'next/dynamic'
import { useSelector } from "react-redux"

const DEBUG = true

const LeafletWithNoSSR = dynamic( () => import( "components/geo/Leaflet" ),
	{ ssr: false } )

export default function LeafletNoSSR( { wells, className } ) {
	const ipLocation = useSelector( r => r.ipLocation )

	const [ center, set_center ] = useState( { lat: 0, lng: 0 } )
	const [ map, set_map ] = useState()
	const [ bounds, set_bounds ] = useState()
	const heatmap = useRef()

	useEffect( () => {
		if( !ipLocation ) return
		set_center( ipLocation )
		DEBUG && console.log( { ipLocation } )
	}, [ ipLocation?.lat, ipLocation?.lng ] )

	const handleOnMove = useCallback( ( center, _bounds ) => {
		DEBUG && console.log( { _bounds } )
		set_bounds( _bounds )
		set_center( { lat: center.lat, lng: center.lng } )
	}, [ set_center ] )

	if( map && wells?.length > 0 ) {
		if( heatmap.current ) map.removeLayer( heatmap.current )

		let lastWell = {}
		const mergedWells = []

		wells.forEach( well => {
			if( lastWell.y === well.position.y && lastWell.x === well.position.x ) {
				lastWell.gas = ( lastWell.gas ?? 0 ) + well.gasProduction
				lastWell.oil = ( lastWell.oil ?? 0 ) + well.oilProduction
			} else {
				if( lastWell.x ) mergedWells.push( lastWell )
				lastWell = {
					y: well.position.y,
					x: well.position.x,
					gas: well.gasProduction,
					oil: well.oilProduction,
					title: well.bottomHole
				}
			}
		} )

		if( lastWell.x ) mergedWells.push( lastWell )
		DEBUG && console.log( 'Wells', mergedWells.length )

		if( mergedWells.length > 20 )
			heatmap.current = window.L.heatLayer(
				mergedWells.map( w => [ w.y, w.x, w.gas ] ),
				{ radius: 15 }
			).addTo( map )
		else
			heatmap.current = window.L.featureGroup(
				mergedWells.map( w => window.L.marker(
					[ w.y, w.x ],
				).bindPopup( `<b>${ w.title }</b><br>Oil: ${ w.oil?.toFixed( 1 ) }<br>Gas: ${ w.gas?.toFixed( 1 ) }` ) )
			).addTo( map )

		// window.L.marker( [ well.position.y, well.position.x ] ).addTo( map )
		// console.log( markers.current )
		// const group = window.L.featureGroup( markers.current ).addTo( map )
	}

	DEBUG && console.log( { map, wells, center } )

	if( !center?.lat ) return null

	return (
		<LeafletWithNoSSR
			center={ center }
			onMove={ handleOnMove }
			onMap={ set_map }
			className={ className }
		/>
	)
}
