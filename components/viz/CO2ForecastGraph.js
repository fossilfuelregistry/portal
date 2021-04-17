import React, { useCallback, useMemo } from "react"
import { Group } from '@visx/group'
import { AreaStack, Bar, LinePath } from '@visx/shape'
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import { defaultStyles, TooltipWithBounds, withTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { bisector, max } from 'd3-array'
import { withParentSize } from "@visx/responsive"
import { textsSelector, useStore } from "lib/zustandProvider"
import { getCO2, getFuelCO2, getFuelScopeCO2 } from "./util"

const DEBUG = false

const getYear = d => d.year
const getY0 = d => d[ 0 ]
const getY1 = d => d[ 1 ]
const getOilReservesCO2 = d => d.reserves.oil.scope1.co2 + d.reserves.oil.scope3.co2
const getGasReservesCO2 = d => d.reserves.gas.scope1.co2 + d.reserves.gas.scope3.co2
const getStable = d => getCO2( d.future.stable.production )
const getDecline = d => getCO2( d.future.decline.production )

//#008080,#70a494,#b4c8a8,#f6edbd,#edbb8a,#de8a5a,#ca562c

function CO2ForecastGraphBase( {
	data, projection,
	parentWidth,
	tooltipLeft, tooltipTop, tooltipData,
	hideTooltip, showTooltip
} ) {
	const texts = useStore( textsSelector )
	const height = 500
	const margin = { left: 30, top: 10 }

	// scales
	const yearScale = scaleLinear( {
		range: [ 0, parentWidth - margin.left ],
		domain: [ 2010, 2040 ],
	} )

	const maxCO2 = useMemo( () => {
		let maxValues = {}
		Object.keys( data[ 0 ] ).forEach( key => {
			if( key === 'future' ) return
			if( key === 'year' ) return
			maxValues[ key ] = max( data, d => getCO2( d[ key ] ) )
		} )
		console.log( { maxValues } )
		return maxValues
	}, [ data ] )

	const getFutureReserve = useCallback( ( d, fuel ) => {
		//console.log( d.year, d, d.future[ projection ].reserves.oil.co2 )
		return getFuelCO2( d.future[ projection ].reserves[ fuel ] )
	}, [ projection ] )

	const productionScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2.production ],
	} )

	const reservesScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2.reserves ],
	} )

	// tooltip handler
	const bisectDate = bisector( d => {
		//console.log( 'bisectDate', d )
		return d.year
	} ).left

	const getProductionCO2 = d => {
		return getCO2( d.production )
	}

	const handleTooltip = useCallback(
		event => {
			const l = localPoint( event )
			const { x } = l || { x: 0 }
			const x0 = yearScale.invert( x )
			const index = bisectDate( data, x0, 1 )
			const d0 = data[ index - 1 ]
			const d1 = data[ index ]
			let d = d0
			if( d1 && getYear( d1 ) ) {
				d = x0.valueOf() - getYear( d0 ).valueOf() > getYear( d1 ).valueOf() - x0.valueOf() ? d1 : d0
			}
			//console.log( { d, v: getValue( d ), y: yScale( getValue( d ) ) } )
			showTooltip( {
				tooltipData: d,
				tooltipLeft: x,
				tooltipTop: productionScale( getProductionCO2( d ) ),
			} )
		},
		[ showTooltip, productionScale, yearScale ],
	)

	const tip = tooltipData

	return (
		<div className="graph">
			<svg width={'100%'} height={height}>
				<Group left={margin.left} top={0}>
					<AxisBottom
						top={height - 22}
						scale={yearScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => `${x.toFixed( 0 )}`}
					/>

					<AxisLeft
						scale={productionScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => x.toFixed( 1 ).toString()}
					/>

					<AxisRight
						scale={reservesScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => x.toFixed( 1 ).toString()}
						left={parentWidth - 80}
					/>

					<AreaStack
						keys={[ 'oil_projection', 'gas_projection' ]}
						data={data.map( d => ( {
							oil_projection: getFuelCO2( d.projection.oil ),
							gas_projection: getFuelCO2( d.projection.gas ),
							year: d.year
						} ) )}
						defined={d => ( getY0( d ) > 0 || getY1( d ) > 0 ) && d.data.year >= 2010}
						x={d => {
							const x = yearScale( getYear( d.data ) ) ?? 0
							//console.log( { d, x } )
							return x
						}}
						y0={d => productionScale( getY0( d ) ) ?? 0}
						y1={d => productionScale( getY1( d ) ) ?? 0}
					>
						{( { stacks, path } ) =>
							stacks.map( stack => {
								return (
									<path
										key={`stack-${stack.key}`}
										d={path( stack ) || ''}
										stroke="transparent"
										fill={{
											oil_projection: "#de8a5a",
											gas_projection: "#ca562c"
										}[ stack.key ]}
									/>
								)
							} )}
					</AreaStack>

					<AreaStack
						keys={[ 'oil1', 'gas1', 'oil3', 'gas3' ]}
						data={data.map( d => ( {
							oil1: getFuelScopeCO2( d.production.oil.scope1 ),
							oil3: getFuelScopeCO2( d.production.oil.scope3 ),
							gas1: getFuelScopeCO2( d.production.gas.scope1 ),
							gas3: getFuelScopeCO2( d.production.gas.scope3 ),
							year: d.year
						} ) )}
						defined={d => ( getY0( d ) > 0 || getY1( d ) > 0 ) && d.data.year >= 2010}
						x={d => {
							const x = yearScale( getYear( d.data ) ) ?? 0
							//console.log( { d, x } )
							return x
						}}
						y0={d => productionScale( getY0( d ) ) ?? 0}
						y1={d => productionScale( getY1( d ) ) ?? 0}
					>
						{( { stacks, path } ) =>
							stacks.map( stack => {
								return (
									<path
										key={`stack-${stack.key}`}
										d={path( stack ) || ''}
										stroke="transparent"
										fill={{
											oil1: "#008080",
											gas1: "#70a494",
											oil3: "#b4c8a8",
											gas3: "#f6edbd"
										}[ stack.key ]}
									/>
								)
							} )}
					</AreaStack>

					<LinePath
						curve={curveLinear}
						className="reserves oil"
						data={data}
						defined={d => d.year >= 2010 && getOilReservesCO2( d ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => reservesScale( getOilReservesCO2( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

					<LinePath
						curve={curveLinear}
						className="reserves gas"
						data={data}
						defined={d => d.year >= 2010 && getGasReservesCO2( d ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => reservesScale( getGasReservesCO2( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

					{projection === 'stable' &&
					<LinePath
						curve={curveLinear}
						className="projection stable"
						data={data}
						defined={d => d.year >= 2010 && getStable( d ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => productionScale( getStable( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>}

					{projection === 'decline' &&
					<LinePath
						curve={curveLinear}
						className="projection decline"
						data={data}
						defined={d => d.year >= 2010 && getDecline( d ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => productionScale( getDecline( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>}

					<LinePath
						curve={curveLinear}
						className="projection reserves oil"
						data={data}
						defined={d => d.year >= 2010 && getFutureReserve( d, 'oil' ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => reservesScale( getFutureReserve( d, 'oil' ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

					<LinePath
						curve={curveLinear}
						className="projection reserves gas"
						data={data}
						defined={d => d.year >= 2010 && getFutureReserve( d, 'gas' ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => reservesScale( getFutureReserve( d, 'gas' ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

				</Group>

				<Bar
					x={margin.left}
					y={margin.top}
					width={parentWidth - margin.left}
					height={height - margin.top}
					fill="transparent"
					onTouchStart={handleTooltip}
					onTouchMove={handleTooltip}
					onMouseMove={handleTooltip}
					onMouseLeave={() => hideTooltip()}
				/>

			</svg>
			{tip && (
				<div>
					<TooltipWithBounds
						key={Math.random()}
						top={tooltipTop - 12}
						left={tooltipLeft + 12}
						style={{
							...defaultStyles,
							minWidth: 60,
							backgroundColor: 'rgba(0,0,0,0.7)',
							color: 'white',
							lineHeight: 1.2
						}}
					>
						<h4 style={{ color: 'white' }}>{tip.year}</h4>
						<table>
							<tbody>
								<tr>
									<td>{texts?.production} {texts?.oil} 1&nbsp;</td>
									<td align="right">{getFuelScopeCO2( tip.production.oil.scope1 )?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.production} {texts?.oil} 3&nbsp;</td>
									<td align="right">{getFuelScopeCO2( tip.production.oil.scope3 )?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.production} {texts?.gas} 1&nbsp;</td>
									<td align="right">{getFuelScopeCO2( tip.production.gas.scope1 )?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.production} {texts?.gas} 3&nbsp;</td>
									<td align="right">{getFuelScopeCO2( tip.production.gas.scope3 )?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.reserves} {texts?.oil}&nbsp;</td>
									<td align="right">{getFuelCO2( tip.reserves.oil )?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.reserves} {texts?.gas}&nbsp;</td>
									<td align="right">{getFuelCO2( tip.reserves.gas )?.toFixed( 1 )}</td>
								</tr>
							</tbody>
						</table>
					</TooltipWithBounds>
				</div>
			)}

			<style jsx>{`
              :global(path.projection) {
                stroke: #333333;
                stroke-width: 3;
                stroke-dasharray: 8;
              }

              :global(path.reserves) {
                stroke-width: 3;
              }

              :global(path.reserves.oil) {
                stroke: #b1663d;
              }

              :global(path.reserves.gas) {
                stroke: #4382b3;
              }
			`}
			</style>
		</div> )
}

export default withParentSize( withTooltip( CO2ForecastGraphBase ) )
