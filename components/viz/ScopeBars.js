import React from "react"
import PercentileBar from "components/viz/PercentileBar"
import { withParentSize } from "@visx/responsive"
import { sumOfCO2 } from "../CO2Forecast/calculate"
import getConfig from "next/config"
import useText from "lib/useText"
import { Modal } from "antd"
import ReactMarkdown from "react-markdown"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables
const colWidth = 130

function helpModal( title, content ) {
	return Modal.info( {
		title,
		content: ( <ReactMarkdown>{ content }</ReactMarkdown> )
	} )
}

function ScopeBarsBase( { totals = [], parentWidth, parentHeight } ) {
	const { getText } = useText()
	const total = [ 0, 1, 2 ].map( i => sumOfCO2( totals, i ) )
	const maxTotal = total.reduce( ( t, i ) => Math.max( t, i ), 0 )

	DEBUG && console.info( { total, totals, maxTotal, parentHeight } )
	const primary = theme[ '@primary-color' ]
	const textY = parentHeight - 8
	const width = Math.min( parentWidth, colWidth * 3 )

	return (
		<svg
			width={ width } height={ parentHeight }
			viewBox={ "-10 -10 " + width + ' ' + ( ( parentHeight ?? 400 ) + 30 ).toFixed() }
		>
			<PercentileBar
				high={ totals.scope1[ 2 ] }
				mid={ totals.scope1[ 1 ] }
				low={ totals.scope1[ 0 ] }
				height={ parentHeight ?? 400 }
				scale={ maxTotal }
				color={ "#2a1faf" }
				x={ 0 }
				y={ 0 }
				width={ 80 }
			/>

			<text x={ 40 } y={ textY } fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000000">
				<tspan onClick={ () => helpModal( getText( 'scopes' ), getText( 'scope_1' ) ) }>
					{ getText( 'scope1' ).toUpperCase() }
				</tspan>
			</text>

			<PercentileBar
				high={ totals.scope3[ 2 ] }
				mid={ totals.scope3[ 1 ] }
				low={ totals.scope3[ 0 ] }
				height={ parentHeight ?? 400 }
				scale={ maxTotal }
				color={ "#1b8d98" }
				x={ colWidth }
				y={ 0 }
				width={ 80 }
			/>

			<text x={ 170 } y={ textY } fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000000">
				<tspan onClick={ () => helpModal( getText( 'scopes' ), getText( 'scope_3' ) ) }>
					{ getText( 'scope3' ).toUpperCase() }
				</tspan>
			</text>

			<PercentileBar
				high={ total[ 2 ] }
				mid={ total[ 1 ] }
				low={ total[ 0 ] }
				height={ parentHeight ?? 400 }
				scale={ maxTotal }
				color={ primary }
				x={ 2 * colWidth }
				y={ 0 }
				width={ 80 }
			/>

			<text x={ 300 } y={ textY } fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000000">
				<tspan>{ getText( 'total' ).toUpperCase() }</tspan>
			</text>

		</svg> )
}

const ScopeBars = withParentSize( ScopeBarsBase )
export default ScopeBars
