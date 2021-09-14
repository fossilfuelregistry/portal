import React from "react"
import TopNavigation from "components/navigation/TopNavigation"
import Footer from "components/Footer"
import gaussian from 'gaussian'
import { solve } from 'solv.js'
import getConfig from "next/config"
//import palette from 'google-palette'
import Color from 'color'

const DEBUG = false
const theme = getConfig()?.publicRuntimeConfig?.themeVariables

// Function to calculate percentile value from variance
function percentile( variance, p, mean ) {
	const d = gaussian( mean, variance ** 2 )
	return d.ppf( p )
}

function PercentileBar( { low, mid, high, scale, height, x, y, width } ) {
	DEBUG && console.log( { low, mid, high, height, x, y, width } )

	// Find variance of two asymmetric distributions from known low/mid and mid/high points
	const lowVariance = solve( v => percentile( v, 0.05, mid ), low, ( mid - low ) / 2, 0.05, 100 )
	const highVariance = solve( v => percentile( v, 0.95, mid ), high, ( high - mid ) / 2, 0.05, 100 )

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
	const primary = theme[ '@primary-color' ]
	for( let c = 0; c <= 10; c++ ) {
		colSeq.push( Color( primary ).darken( 0.4 ).desaturate( c / 30 ).lighten( c/3.5 ).hex() )
	}
	const colSeqRev = [ ...colSeq ].reverse()
	const tileColors = [ ...colSeqRev, ...colSeq ]//.map( c => '#' + c )
	DEBUG && console.log( tileColors )
	const scaleY = v => height * ( 1 - v / scale )

	const textX = x + width + 2
	let textHighY = scaleY( high )
	let textMidY = scaleY( mid )
	let textLowY = scaleY( low )

	// De-clutter (Positive Y downwards!)
	if( textHighY - textMidY > -15 ) textHighY = textMidY - 10
	if( textMidY - textLowY > -15 ) textLowY = textMidY + 12

	return (
		<g className="percentile-bar">
			{ percentilePoints.map( ( v, i ) => {
				const y = scaleY( percentilePoints[ i ] )
				const pHeight = ( i === 0 ? height - y : scaleY( percentilePoints[ i - 1 ] ) - y )
				DEBUG && console.log( { i, v, y, height, c: tileColors[ i ] } )
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
			<text className="numeric" x={ textX } y={ textHighY } fontSize="11" fontWeight="bold" textAnchor="left">
				<tspan dy={ 5 }>{ high }</tspan>
			</text>
			<text
				className="numeric"
				x={ textX } y={ textMidY } fontSize="14" fontWeight="bold" textAnchor="left"
			>
				<tspan dy={ 7 }>{ mid }</tspan>
			</text>
			<text className="numeric" x={ textX } y={ textLowY } fontSize="11" fontWeight="bold" textAnchor="left">
				<tspan dy={ 5 }>{ low }</tspan>
			</text>
		</g> )
}

export default function MapPage() {

	return (
		<div className="page">
			<TopNavigation/>

			<div className="page-padding">

				<svg width="500" height={ 520 }>
					<PercentileBar
						high={ 904 }
						mid={ 847 }
						low={ 796 }
						height={ 500 }
						scale={ 1100 }
						x={ 0 }
						y={ 0 }
						width={ 50 }
					/>

					<PercentileBar
						high={ 210 }
						mid={ 202 }
						low={ 195 }
						height={ 500 }
						scale={ 1100 }
						x={ 100 }
						y={ 0 }
						width={ 50 }
					/>

					<PercentileBar
						high={ 553 }
						mid={ 321 }
						low={ 262 }
						height={ 500 }
						scale={ 1100 }
						x={ 200 }
						y={ 0 }
						width={ 50 }
					/>

					<PercentileBar
						high={ 343 }
						mid={ 119 }
						low={ 67 }
						height={ 500 }
						scale={ 1100 }
						x={ 300 }
						y={ 0 }
						width={ 50 }
					/>
				</svg>

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
