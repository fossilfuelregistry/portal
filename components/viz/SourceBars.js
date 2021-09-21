import React from "react"
import PercentileBar from "components/viz/PercentileBar"
import { withParentSize } from "@visx/responsive"
import getConfig from "next/config"
import useText from "lib/useText"
import { sumOfCO2 } from "../CO2Forecast/calculate"

const DEBUG = true

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

function SourceBarsBase( { sources = [], parentWidth, parentHeight } ) {
	const { getText } = useText()

	let maxTotal = 0
	sources.forEach( s => {
		s.range = [ 0, 1, 2 ]
			.map( i => {
				const volume = s.sourceId === 100 ? s.total[ i ] : sumOfCO2( s.total, i )
				maxTotal = Math.max( maxTotal, volume )
				return volume
			} )
	} )

	DEBUG && console.log( { sources, maxTotal, parentHeight } )
	const primary = theme[ '@primary-color' ]
	const textY = parentHeight - 8

	return (
		<svg
			width={ parentWidth } height={ parentHeight }
			viewBox={ "-10 -10 400 " + ( ( parentHeight ?? 400 ) + 20 ).toFixed() }
		>
			{ sources.map( ( s, i ) => {
				DEBUG && console.log( 'Source', s.name, s.range )
				return (
					<g key={ s.sourceId }>
						<PercentileBar
							high={ s.range[ 2 ] }
							mid={ s.range[ 1 ] }
							low={ s.range[ 0 ] }
							height={ parentHeight ?? 400 }
							scale={ maxTotal }
							color={ primary }
							x={ i * 130 }
							y={ 0 }
							width={ 80 }
						/>

						<text
							x={ ( i * 130 ) + 40 } y={ textY }
							fontSize="14" fontWeight="bold"
							textAnchor="middle" fill="#000000"
						>
							<tspan>{ s.name?.startsWith( 'name_' ) ? getText( s.name ) : s.name }</tspan>
						</text>
					</g>
				)
			} ) }
		</svg> )
}

const SourceBars = withParentSize( SourceBarsBase )
export default SourceBars
