import React, { useCallback, useEffect, useRef, useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { gql, useQuery } from '@apollo/client'
import { useSelector } from "react-redux"
import useText from "../lib/useText"
import Footer from "../components/Footer"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const Q_PRODUCTION = gql`
query ProductionWells( $swLat: Float! $swLng: Float! $neLat: Float! $neLng: Float! ) {
  findProductionIn(neLat: $neLat, neLng: $neLng, swLat: $swLat, swLng: $swLng) {
    nodes {
      id gasProduction oilProduction bottomHole
      position { ... on GeometryPoint { x y } }
    }
  }
}`

const MapWithNoSSR = dynamic( () => import( "components/geo/Leaflet" ),
	{ ssr: false } )

export default function Wells() {
	const ipLocation = useSelector( r => r.ipLocation )
	const { getText } = useText()

	const [ center, set_center ] = useState( { lat: 0, lng: 0 } )
	const [ map, set_map ] = useState()
	const [ bounds, set_bounds ] = useState()
	const heatmap = useRef()

	useEffect( () => {
		if( !ipLocation ) return
		set_center( ipLocation )
	},
	[ ipLocation?.lat, ipLocation?.lng ] )

	const handleOnMove = useCallback( ( center, _bounds ) => {
		console.info( _bounds )
		set_bounds( _bounds )
		set_center( { lat: center.lat, lng: center.lng } )
	}, [ set_center ] )

	const { data: production } = useQuery( Q_PRODUCTION, {
		variables: {
			swLat: bounds?._southWest.lat,
			swLng: bounds?._southWest.lng,
			neLat: bounds?._northEast.lat,
			neLng: bounds?._northEast.lng
		},
		skip: !bounds
	} )

	const wells = production?.findProductionIn?.nodes ?? []

	if( map && wells.length > 0 ) {
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
		DEBUG && console.info( 'Wells', mergedWells.length )

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
		// console.info( markers.current )
		// const group = window.L.featureGroup( markers.current ).addTo( map )
	}

	return (
		<>
			<div className="page">
				<TopNavigation/>

				<div className="content">
					<h3>{ getText( 'well_level_header' ) }</h3>
					<br/>
					<div>{ getText( 'well_level_intro' ) }</div>
					<br/>

					<div className="map">
						<MapWithNoSSR
							className="wells"
							center={ center }
							onMove={ handleOnMove }
							onMap={ set_map }
						/>
					</div>
				</div>

				<Footer/>

				<style jsx>{ `
                  .content {
                    margin-left: 40px;
                    margin-right: 40px;
                  }

                  .map {
                    position: relative;
                    height: 80vh;
                  }
				` }
				</style>

			</div>
		</>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
