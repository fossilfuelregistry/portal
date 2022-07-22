import { solve } from "solv.js"
import gaussian from "gaussian"
import Color from "color"
import React from "react"
import getConfig from "next/config"
import { Modal } from "antd"
import ReactMarkdown from "react-markdown"
import useText from "../../lib/useText"
import useNumberFormatter from "../../lib/useNumberFormatter"
import { captureException } from "@sentry/nextjs"
//import palette from 'google-palette'

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

function helpModal( title, content ) {
	return Modal.info( {
		title,
		content: ( <ReactMarkdown>{ content }</ReactMarkdown> )
	} )
}

// Function to calculate percentile value from variance
function percentile( variance, p, mean ) {
	if( !( variance > 0 ) ) return 0
	const d = gaussian( mean, variance ** 2 )
	return d.ppf( p )
}

/*function toCustomPrecision( x ) {
	if( x < 1000 ) return x.toPrecision( 3 )
	if( x < 10000 ) return ( x / 10 ).toFixed() + '0'
	if( x < 100000 ) return ( x / 100 ).toFixed() + '00'
	if( x < 1000000 ) return ( x / 1000 ).toFixed() + ' 000'
}*/


export default function PercentileBar( { low, mid, high, scale, height, x, y, width, color } ) {
	const { getText } = useText()
	const toCustomPrecision =	useNumberFormatter()

	DEBUG && console.info( 'PercentileBar', { low, mid, high, scale, height, x, y, width } )

	if( mid === 0 ) {
		console.info( 'PercentileBar NO DATA', { low, mid, high, scale, height, x, y, width } )
		return "?"
	}

	let lowVariance, highVariance
	try {
		// Find variance of two asymmetric distributions from known low/mid and mid/high points
		lowVariance = solve( v => percentile( v, 0.05, mid ), low, ( mid - low ) / 2, 0.05, 100 )
		highVariance = solve( v => percentile( v, 0.95, mid ), high, ( high - mid ) / 2, 0.05, 100 )

		const lowDistribution = gaussian( mid, lowVariance ** 2 )
		const highDistribution = gaussian( mid, highVariance ** 2 )

		// Vector of full p05 -- p95 range values
		const percentilePoints = []
		for( let percent = 5; percent <= 95; percent += 5 ) {
			if( percent <= 50 )
				percentilePoints.push( lowDistribution.ppf( percent / 100 ) )
			else
				percentilePoints.push( highDistribution.ppf( percent / 100 ) )
		}

		//const tolSeq = palette( 'cb-BrBG', 11 )
		//const tolSeq = palette( 'tol-sq', 11 )
		// const tolSeq = [ '#0A99FF', '#008FF5', '#0083E0', '#0077CC', '#006BB8', '#005FA3', '#005694', '#00477A', '#003C66', '#003052', '#00243D' ]

		let colSeq = []
		for( let c = 0; c <= 10; c++ ) {
			colSeq.push( Color( color ).darken( ( 10 - c ) / 30 ).desaturate( c / 20 ).lighten( c / 7 ).hex() )
		}
		const colSeqRev = [ ...colSeq ].reverse()
		const tileColors = [ ...colSeqRev, ...colSeq ]//.map( c => '#' + c )
		DEBUG && console.info( tileColors )
		const scaleY = v => height * ( 1 - v / scale )

		
		const textX = x + width + 2
		let textHighY = scaleY( high )
		let textMidY = scaleY( mid )
		let textLowY = scaleY( low )

		// De-clutter (Positive Y downwards!)
		if( textHighY - textMidY > -15 ) textHighY = textMidY - 12
		if( textMidY - textLowY > -15 ) textLowY = textMidY + 15

		return (
			<g className="percentile-bar">
				{ percentilePoints.map( ( v, i ) => {
					const y = scaleY( percentilePoints[ i ] )
					const pHeight = ( i === 0 ? height - y : scaleY( percentilePoints[ i - 1 ] ) - y )
					DEBUG && console.info( { i, v, y, height, c: tileColors[ i ] } )
					return (
						<rect
							key={ v }
							x={ x }
							y={ y }
							height={ pHeight }
							width={ width }
							fill={ tileColors[ i + 2 ] }
						/> )
				} ) }
				<text
					className="numeric" x={ textX } y={ textHighY } fontSize="14" fontWeight="bold" textAnchor="left"
					fill="#aaaaaa"
				>
					<tspan
						dy={ 5 } onClick={ () => helpModal( getText( 'ranges' ), getText( 'P95' ) ) }
						   style={ { cursor: 'help' } }
					>
						{ toCustomPrecision( high ) }
					</tspan>
				</text>
				<text
					className="numeric"
					onClick={ () => helpModal( getText( 'ranges' ), getText( 'WA' ) ) }
					style={ { cursor: 'help' } }
					x={ textX } y={ textMidY } fontSize="18" fontWeight="bold" textAnchor="left"
				>
					<tspan dy={ 7 }>{ toCustomPrecision( mid ) }</tspan>
				</text>
				<text
					onClick={ () => helpModal( getText( 'ranges' ), getText( 'P5' ) ) }
					style={ { cursor: 'help' } }
					className="numeric" x={ textX } y={ textLowY } fontSize="14" fontWeight="bold" textAnchor="left"
					fill="#aaaaaa"
				>
					<tspan dy={ 5 }>{ toCustomPrecision( low ) }</tspan>
				</text>
			</g> )
	} catch( e ) {
		console.info( { lowVariance, highVariance, low, mid, high } )
		console.info( e )
		captureException( e )
		return <text>PercentileBar calculations failed: { e.message }</text>
	}
}
