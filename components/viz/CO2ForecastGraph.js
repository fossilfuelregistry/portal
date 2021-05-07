import React, { useCallback, useMemo } from "react"
import { Group } from '@visx/group'
import { AreaStack, Bar, LinePath } from '@visx/shape'
import { AxisBottom, AxisRight } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import { withTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { bisector, max } from 'd3-array'
import { withParentSize } from "@visx/responsive"
import { getCO2, getFuelCO2 } from "./util"
import useText from "lib/useText"

const DEBUG = true

//#008080,#70a494,#b4c8a8,#f6edbd,#edbb8a,#de8a5a,#ca562c

function CO2ForecastGraphBase( {
	data, projection, estimate, estimate_prod,
	parentWidth,
	tooltipLeft, tooltipTop, tooltipData,
	hideTooltip, showTooltip
} ) {
	const { getText } = useText()
	const height = 500
	const margin = { left: 0, top: 10 }

	const getYear = d => d.year
	const getY0 = d => d[ 0 ]
	const getY1 = d => d[ 1 ]
	const getAuth = d => getCO2( d.future.authority.production, estimate_prod )
	const getStable = d => getCO2( d.future.stable.production, estimate_prod )
	const getDecline = d => getCO2( d.future.decline.production, estimate_prod )

	const showReserves = false

	//DEBUG && console.log( 'GRAPH', { estimate_prod, estimate, projection } )
	let projectionType = projection
	if( projection > 0 ) projectionType = 'authority'

	const getFutureReserve = useCallback( ( d, fuel ) => {
		//console.log( d.year, d, d.future[ projectionType ].reserves.oil.co2 )
		return getFuelCO2( d.future.reserves.p[ fuel ], estimate ) + getFuelCO2( d.future.reserves.c[ fuel ], estimate )
	}, [ projectionType, estimate ] )

	// scale
	const yearScale = scaleLinear( {
		range: [ 0, parentWidth - margin.left ],
		domain: [ 2010, 2040 ],
	} )

	const maxCO2 = useMemo( () => {
		let maxValue = max(
			data.filter( d => d.year > 2010 ),
			d => getCO2( d.production, 4 )
		)
		//DEBUG && console.log( { maxValue } )
		return maxValue
	}, [ data ] )

	const productionScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2 ],
	} )

	const reservesScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, max( data, d => getCO2( d.future[ projectionType ].reserves, estimate ) ) ]
	} )

	//console.log( { projection, projectionType, d: data[ 45 ] } )

	const bisectDate = bisector( d => {
		//console.log( 'bisectDate', d )
		return d.year
	} ).left

	const handleTooltip = useCallback(
		event => {
			const x = localPoint( event )?.x ?? 0
			const x0 = yearScale.invert( x )
			const index = bisectDate( data, x0, 1 )
			const d0 = data[ index - 1 ]
			const d1 = data[ index ]
			let d = d0
			if( d1 && getYear( d1 ) ) {
				d = x0.valueOf() - getYear( d0 ).valueOf() > getYear( d1 ).valueOf() - x0.valueOf() ? d1 : d0
			}
			//console.log( { d, v: getValue( d ), y: yScale( getValue( d ) ) } )
			let ttt = getCO2( d.production, estimate_prod )
			if( ttt === 0 )
				ttt = getCO2( d.future[ projectionType ]?.production, estimate_prod )
			showTooltip( {
				tooltipData: d,
				tooltipLeft: x,
				tooltipTop: productionScale( ttt ),
			} )
		},
		[ showTooltip, productionScale, yearScale ],
	)

	const tip = tooltipData
	if( !( maxCO2 > 0 ) ) return null // JSON.stringify( maxCO2 )

	const productionData = data.map( d => ( {
		oil: getFuelCO2( d.production.oil, estimate_prod ),
		gas: getFuelCO2( d.production.gas, estimate_prod ),
		year: d.year
	} ) )

	return (
		<div className="graph">
			<svg width={'100%'} height={height}>
				<Group left={margin.left} top={0}>
					<AxisBottom
						top={height - 30}
						scale={yearScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => `${x.toFixed( 0 )}`}
						tickLabelProps={() => ( {
							dy: '0.25em',
							fill: '#222',
							fontFamily: 'Arial',
							fontSize: 13,
							textAnchor: 'middle',
						} )}
					/>

					<AreaStack
						keys={[ 'oil_c', 'oil_p', 'gas_c', 'gas_p' ]}
						data={data.map( d => ( {
							oil_p: getFuelCO2( d.future.reserves.production?.p.oil, estimate_prod ),
							oil_c: getFuelCO2( d.future.reserves.production?.c.oil, estimate_prod ),
							gas_p: getFuelCO2( d.future.reserves.production?.p.gas, estimate_prod ),
							gas_c: getFuelCO2( d.future.reserves.production?.c.gas, estimate_prod ),
							year: d.year
						} ) )}
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
											oil_p: "#b4c8a8",
											gas_c: "#edbb8a",
											gas_p: "#f6edbd",
											oil_c: "#de8a5a"
										}[ stack.key ]}
									/>
								)
							} )}
					</AreaStack>

					<AreaStack
						keys={[ 'oil', 'gas' ]}
						data={productionData}
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
											oil: "#008080",
											gas: "#70a494",
										}[ stack.key ]}
									/>
								)
							} )}
					</AreaStack>

					<LinePath
						curve={curveLinear}
						className="projection stable"
						data={data}
						defined={d => d.year >= 2010 && getStable( d ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => productionScale( getStable( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

					<LinePath
						curve={curveLinear}
						className="projection decline"
						data={data}
						defined={d => d.year >= 2010 && getDecline( d ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => productionScale( getDecline( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

					<LinePath
						curve={curveLinear}
						className="projection auth"
						data={data}
						defined={d => d.year >= 2010 && getAuth( d ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => productionScale( getAuth( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

					{showReserves &&
					<LinePath
						curve={curveLinear}
						className="projection reserves oil"
						data={data}
						defined={d => d.year >= 2020 && getFutureReserve( d, 'oil' ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => reservesScale( getFutureReserve( d, 'oil' ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>}

					{showReserves &&
					<LinePath
						curve={curveLinear}
						className="projection reserves gas"
						data={data}
						defined={d => d.year >= 2020 && getFutureReserve( d, 'gas' ) > 0}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => reservesScale( getFutureReserve( d, 'gas' ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>}

					<AxisRight
						scale={productionScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => x.toFixed( 0 ).toString()}		
						tickLabelProps={() => ( {
							dx: '0.25em',
							dy: '0.25em',
							fill: '#222',
							fontFamily: 'Arial',
							fontSize: 13,
							textAnchor: 'start',
						} )}

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
					onMouseLeave={() => {
						hideTooltip()
					}}
				/>

			</svg>

			<div className="legend">
				<table>
					<tbody>
						<tr>
							<td>
								<div className="blob gas past"/>
							</td>
							<td>{getText( 'gas' )} {getText( 'past_emissions' )}</td>
						</tr>
						<tr>
							<td>
								<div className="blob oil past"/>
							</td>
							<td>{getText( 'oil' )} {getText( 'past_emissions' )}</td>
						</tr>
						<tr>
							<td>
								<div className="blob gas p"/>
							</td>
							<td>{getText( 'gas' )}: {getText( 'against_reserves' )}</td>
						</tr>
						<tr>
							<td>
								<div className="blob oil p"/>
							</td>
							<td>{getText( 'oil' )}: {getText( 'against_reserves' )}</td>
						</tr>
						<tr>
							<td>
								<div className="blob gas c"/>
							</td>
							<td>{getText( 'gas' )}: {getText( 'against_contingent' )}</td>
						</tr>
						<tr>
							<td>
								<div className="blob oil c"/>
							</td>
							<td>{getText( 'oil' )} : {getText( 'against_contingent' )}</td>
						</tr>
					</tbody>
				</table>

			</div>

			<style jsx>{`
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
                background-color: #008080;
              }

              .gas.past {
                background-color: #70a494;
              }

              .oil.p {
                background-color: #b4c8a8;
              }

              .gas.p {
                background-color: #f6edbd;
              }

              .oil.c {
                background-color: #de8a5a;
              }

              .gas.c {
                background-color: #edbb8a;
              }
			`}
			</style>
		</div> )
}

//#008080,#70a494,#b4c8a8,#f6edbd,#edbb8a,#de8a5a,#ca562c

export default withParentSize( withTooltip( CO2ForecastGraphBase ) )

/*
	const getOilReservesCO2 = d => makeEstimate( d.reserves.oil.scope1, estimate )
		+ makeEstimate( d.reserves.oil.scope3, estimate )
	const getGasReservesCO2 = d => makeEstimate( d.reserves.gas.scope1, estimate )
		+ makeEstimate( d.reserves.gas.scope3, estimate )

	const getFutureReserve = useCallback( ( d, fuel ) => {
		//console.log( d.year, d, d.future[ projection ].reserves.oil.co2 )
		return getFuelCO2( d.future[ projection ].reserves[ fuel ], estimate )
	}, [ projection, estimate ] )

	const reservesScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2.reserves * 0.7 ],
	} )



					<AxisLeft
						scale={reservesScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => x.toFixed( 1 ).toString()}
						left={parentWidth - margin.left}
					/>

			{tip && (
				<TooltipWithBounds
					key={Math.random()}
					style={{
						...defaultStyles,
						minWidth: 60,
						backgroundColor: 'rgba(0,0,0,0.7)',
						color: 'white',
						lineHeight: 1.2,
						left: tooltipLeft,
						top: tooltipTop - 12
					}}
				>
					<h4 style={{ color: 'white' }}>{tip.year}</h4>

					{tip.production.oil.scope1.co2 > 0 &&
					<table>
						<tbody>
							<tr>
								<td>{getText( 'production' )} {getText( 'oil' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.production.oil, estimate_prod )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'production' )} {getText( 'gas' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.production.gas, estimate_prod )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'reserves' )} {getText( 'oil' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.reserves.oil, estimate )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'reserves' )} {getText( 'gas' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.reserves.gas, estimate )?.toFixed( 1 )}</td>
							</tr>
						</tbody>
					</table>}

					{tip.production.oil.scope1.co2 <= 0 && projectionType !== 'authority' &&
					<table>
						<tbody>
							<tr>
								<td>{getText( 'production' )} {getText( 'oil' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.future[ projectionType ].production.oil, estimate_prod )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'production' )} {getText( 'gas' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.future[ projectionType ].production.gas, estimate_prod )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'reserves' )} {getText( 'oil' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.future[ projectionType ].reserves.oil, estimate )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'reserves' )} {getText( 'gas' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.future[ projectionType ].reserves.gas, estimate )?.toFixed( 1 )}</td>
							</tr>
						</tbody>
					</table>}

					{tip.production.oil.scope1.co2 <= 0 && projectionType === 'authority' &&
					<table>
						<tbody>
							<tr>
								<td>{getText( 'production' )} {getText( 'oil' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.projection.oil, estimate_prod )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'production' )} {getText( 'gas' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.projection.gas, estimate_prod )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'reserves' )} {getText( 'oil' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.future[ projectionType ].reserves.oil, estimate )?.toFixed( 1 )}</td>
							</tr>
							<tr>
								<td>{getText( 'reserves' )} {getText( 'gas' )}&nbsp;</td>
								<td align="right">{getFuelCO2( tip.future[ projectionType ].reserves.gas, estimate )?.toFixed( 1 )}</td>
							</tr>
						</tbody>
					</table>}

				</TooltipWithBounds>
			)}

 */
