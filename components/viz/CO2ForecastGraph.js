import React, { useMemo } from "react"
import { Group } from '@visx/group'
import { AreaStack, LinePath } from '@visx/shape'
import { AxisBottom, AxisRight } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import { withTooltip } from '@visx/tooltip'
import { max } from 'd3-array'
import { withParentSize } from "@visx/responsive"
import useText from "lib/useText"
import { combineOilAndGas, sumOfCO2 } from "../CO2Forecast/calculate"
import { useSelector } from "react-redux"
import settings from 'settings'

const DEBUG = false

const colors = {
	oil: { past: '#008080', reserves: '#70a494', contingent: '#b4c8a8' },
	gas: { past: '#de8a5a', reserves: '#edbb8a', contingent: '#f6edbd' },
}

//#008080,#70a494,#b4c8a8,#f6edbd,#edbb8a,#de8a5a,#ca562c

function CO2ForecastGraphBase( {
	production, projection, projectedProduction, parentWidth
} ) {
	const { getText } = useText()
	const projectionSourceId = useSelector( redux => redux.projectionSourceId )

	const height = 500
	const margin = { left: 0, top: 10 }

	const getYear = d => d.year
	const getY0 = d => d[ 0 ]
	const getY1 = d => d[ 1 ]
	const getProjection = d => d.co2

	const productionData = combineOilAndGas( production )
		.filter( d => d.year >= settings.year.start )
		.map( d => ( {
			year: d.year,
			oil: d.oil ? sumOfCO2( d.oil.co2, 1 ) : 0,
			gas: d.gas ? sumOfCO2( d.gas.co2, 1 ) : 0
		} ) )

	const projectionData = combineOilAndGas( projection.filter( d => d.sourceId === projectionSourceId ) )
		.filter( d => d.year >= settings.year.start )
		.map( d => ( {
			year: d.year,
			co2: ( d.oil ? sumOfCO2( d.oil.co2, 1 ) : 0 ) + ( d.gas ? sumOfCO2( d.gas.co2, 1 ) : 0 )
		} ) )

	const projProdData = ( projectionSourceId ? combineOilAndGas( projectedProduction ) : [] )
		.filter( d => d.year >= settings.year.start )
		.map( d => ( {
			year: d.year,
			oil_p: d.oil?.plannedProd ?? 0,
			oil_c: d.oil?.continProd ?? 0,
			gas_p: d.gas?.plannedProd ?? 0,
			gas_c: d.gas?.continProd ?? 0
		} ) )

	// scale
	const yearScale = scaleLinear( {
		range: [ 0, parentWidth - margin.left ],
		domain: [ settings.year.start, settings.year.end ],
	} )

	const maxCO2 = useMemo( () => {
		let maxValue = max( productionData, d => d.oil + d.gas )
		DEBUG && console.log( { maxValue } )
		return maxValue
	}, [ productionData ] )

	const productionScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2 ],
	} )

	if( !( maxCO2 > 0 ) ) return null // JSON.stringify( maxCO2 )

	DEBUG && console.log( { productionData, projProdData } )

	return (
		<div className="graph">
			<svg width={ '100%' } height={ height }>
				<Group left={ margin.left } top={ 0 }>
					<AxisBottom
						top={ height - 30 }
						scale={ yearScale }
						numTicks={ parentWidth > 520 ? 8 : 4 }
						tickFormat={ x => `${ x.toFixed( 0 ) }` }
						tickLabelProps={ () => ( {
							dy: '0.25em',
							fill: '#222',
							fontFamily: 'Arial',
							fontSize: 13,
							textAnchor: 'middle',
						} ) }
					/>

					<AreaStack
						keys={ [ 'oil_c', 'oil_p', 'gas_c', 'gas_p' ] }
						data={ projProdData }
						x={ d => yearScale( getYear( d.data ) ) }
						y0={ d => productionScale( getY0( d ) ) }
						y1={ d => productionScale( getY1( d ) ) }
					>
						{ ( { stacks, path } ) =>
							stacks.map( stack => {
								return (
									<path
										key={ `stack-${ stack.key }` }
										d={ path( stack ) || '' }
										stroke="transparent"
										fill={ {
											oil_p: colors.oil.reserves,
											gas_c: colors.gas.contingent,
											gas_p: colors.gas.reserves,
											oil_c: colors.oil.contingent
										}[ stack.key ] }
									/>
								)
							} ) }
					</AreaStack>

					<AreaStack
						keys={ [ 'oil', 'gas' ] }
						data={ productionData }
						defined={ d => ( getY0( d ) > 0 || getY1( d ) > 0 ) }
						x={ d => yearScale( getYear( d.data ) ) }
						y0={ d => productionScale( getY0( d ) ) }
						y1={ d => productionScale( getY1( d ) ) }
					>
						{ ( { stacks, path } ) =>
							stacks.map( stack => {
								return (
									<path
										key={ `stack-${ stack.key }` }
										d={ path( stack ) || '' }
										stroke="transparent"
										fill={ {
											oil: colors.oil.past,
											gas: colors.gas.past,
										}[ stack.key ] }
									/>
								)
							} ) }
					</AreaStack>

					<LinePath
						curve={ curveLinear }
						className="projection auth"
						data={ projectionData }
						defined={ d => getProjection( d ) > 0 }
						x={ d => yearScale( getYear( d ) ) ?? 0 }
						y={ d => productionScale( getProjection( d ) ) ?? 0 }
						shapeRendering="geometricPrecision"
					/>

					<AxisRight
						scale={ productionScale }
						numTicks={ parentWidth > 520 ? 8 : 4 }
						tickFormat={ x => x.toFixed( 0 ).toString() }
						tickLabelProps={ () => ( {
							dx: '0.25em',
							dy: '0.25em',
							fill: '#222',
							fontFamily: 'Arial',
							fontSize: 13,
							textAnchor: 'start',
						} ) }
					/>

					<text x="40" y="18" transform="rotate(0)" fontSize={ 13 }>
						CO²e (e6ton)
					</text>

				</Group>

			</svg>

			<div className="legend">
				<table>
					<tbody>
						<tr>
							<td>
								<div className="blob gas past"/>
							</td>
							<td>{ getText( 'gas' ) } { getText( 'past_emissions' ) }</td>
						</tr>
						<tr>
							<td>
								<div className="blob oil past"/>
							</td>
							<td>{ getText( 'oil' ) } { getText( 'past_emissions' ) }</td>
						</tr>
						<tr>
							<td>
								<div className="blob gas p"/>
							</td>
							<td>{ getText( 'gas' ) }: { getText( 'against_reserves' ) }</td>
						</tr>
						<tr>
							<td>
								<div className="blob oil p"/>
							</td>
							<td>{ getText( 'oil' ) }: { getText( 'against_reserves' ) }</td>
						</tr>
						<tr>
							<td>
								<div className="blob gas c"/>
							</td>
							<td>{ getText( 'gas' ) }: { getText( 'against_contingent' ) }</td>
						</tr>
						<tr>
							<td>
								<div className="blob oil c"/>
							</td>
							<td>{ getText( 'oil' ) } : { getText( 'against_contingent' ) }</td>
						</tr>
					</tbody>
				</table>

			</div>

			<style jsx>{ `
              :global(path.projection) {
                stroke: #333333;
                stroke-width: 2;
                stroke-dasharray: 0;
                stroke-opacity: 0.2;
              }

              :global(path.projection.auth) {
                stroke: #333333;
                stroke-width: 3;
                stroke-dasharray: 0;
                stroke-opacity: 0.4;
              }

              :global(path.reserves) {
                stroke-width: 3;
              }

              :global(path.projection.reserves) {
                stroke-dasharray: 4;
              }

              :global(path.reserves.oil) {
                stroke: #b1663d;
              }

              :global(path.reserves.gas) {
                stroke: #4382b3;
              }

              .graph {
                position: relative;
              }

              .legend {
                position: absolute;
                font-size: 14px;
                top: 20px;
                right: 50px;
                border: 1px solid #dddddd;
                border-radius: 8px;
                padding: 8px 12px 12px;
                background-color: rgba(255, 255, 255, 0.5);
              }

              .blob {
                height: 16px;
                width: 16px;
                border-radius: 6px;
                border: 1px solid #dddddd;
                margin-right: 6px;
              }

              .oil.past {
                background-color: ${ colors.oil.past };
              }

              .gas.past {
                background-color: ${ colors.gas.past };
              }

              .oil.p {
                background-color: ${ colors.oil.reserves };
              }

              .gas.p {
                background-color: ${ colors.gas.reserves };
              }

              .oil.c {
                background-color: ${ colors.oil.contingent };
              }

              .gas.c {
                background-color: ${ colors.gas.contingent };
              }
			` }
			</style>
		</div> )
}

export default withParentSize( withTooltip( CO2ForecastGraphBase ) )
