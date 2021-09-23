import React from "react"
import { Group } from '@visx/group'
import { LinePath } from '@visx/shape'
import { AxisBottom, AxisRight } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import { withParentSize } from "@visx/responsive"
import { max, min } from 'd3-array'
import { useConversionHooks } from "./conversionHooks"
import { Col, Row } from "antd"
import { useSelector } from "react-redux"

const colors = [
	'#008080', '#70a494', '#b4c8a8',
	'#f6edbd', '#edbb8a', '#de8a5a', '#ca562c'
]

function InputDataGraphBase( {
	data = [], fuel, parentWidth, height = 300
} ) {
	const allSources = useSelector( redux => redux.allSources )
	const margin = { left: 0, top: 10 }
	const { convertVolume } = useConversionHooks( )

	if( !( data?.length > 0 ) ) return null

	const years = []
	const sources = []
	const dataset = []

	let currentYearSet
	let maxY = 0

	data.forEach( point => {
		if( point.fossilFuelType !== fuel ) return

		if( !sources.includes( point.sourceId ) ) {
			sources.push( point.sourceId )
		}

		if( !years.includes( point.year ) ) {
			years.push( point.year )
			currentYearSet = { year: point.year }
			dataset.push( currentYearSet )
		}

		let y
		if( point.fossilFuelType === 'gas' ) y = convertVolume( point, 'e9m3' )
		if( point.fossilFuelType === 'oil' ) y = convertVolume( point, 'e6bbl' )

		currentYearSet[ point.sourceId ] = y

		maxY = Math.max( maxY, y )
	} )

	const getYear = d => d.year
	const getY = ( src, d ) => d[ src ] ?? 0

	// scales
	const yearScale = scaleLinear( {
		range: [ 0, parentWidth - margin.left ],
		domain: [ min( years ), max( years ) ],
	} )

	const yScale = scaleLinear( {
		range: [ height - 25, 0 ],
		domain: [ 0, maxY ],
	} )

	return (
		<div className="graph">
			<svg width={'100%'} height={height}>
				<Group left={margin.left} top={0}>
					<AxisBottom
						top={height - 25}
						scale={yearScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => `${x.toFixed( 0 )}`}
						tickLabelProps={() => ( {
							dx: '0.25em',
							dy: '0.25em',
							fill: '#222',
							fontFamily: 'Arial',
							fontSize: 12,
							textAnchor: 'start',
						} )}
					/>

					<AxisRight
						scale={yScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => x.toFixed( 0 ).toString()}
						tickLabelProps={() => ( {
							dx: '0.25em',
							dy: '0.25em',
							fill: '#222',
							fontFamily: 'Arial',
							fontSize: 12,
							textAnchor: 'start',
						} )}
					/>

					{sources.map( ( s, i ) => {
						return (
							<LinePath
								key={s}
								curve={curveLinear}
								className="history-curve"
								data={dataset}
								defined={d => getY( s, d ) > 0}
								x={d => yearScale( getYear( d ) ) ?? 0}
								y={d => yScale( getY( s, d ) ) ?? 0}
								shapeRendering="geometricPrecision"
								stroke={colors[ i ]}
							/>
						)
					} )}

				</Group>

			</svg>

			<Row gutter={20}>
				{sources.map( ( s, i ) => {
					//console.info( 'INPUT', comment, fuel, s )
					const name = allSources.find( src => src.sourceId === s )?.[ 'name' ]
					if( !name?.length ) return null
					return (
						<Col key={s}>
							<div className="blob" style={{ backgroundColor: colors[ i ] }}/>
							{name}
						</Col>
					)
				} )}
			</Row>

			<style jsx>{`
              .graph {
                font-size: 12px;
              }

              .blob {
                height: 8px;
                width: 20px;
                border-radius: 4px;
                margin-right: 6px;
                display: inline-block;
              }

              :global(path.history-curve) {
                stroke-width: 3;
              }
			`}
			</style>
		</div> )
}

export default withParentSize( InputDataGraphBase )
