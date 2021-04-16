import React, { useCallback } from "react"
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

const DEBUG = false

const getX = d => d.year
const getY0 = d => d[ 0 ]
const getY1 = d => d[ 1 ]
const getOilReservesCO2 = d => ( d.reserves_oil?.scope1 ?? 0 ) + ( d.reserves_oil?.scope3 ?? 0 )
const getGasReservesCO2 = d => ( d.reserves_gas?.scope1 ?? 0 ) + ( d.reserves_gas?.scope3 ?? 0 )

function CO2ForecastGraphBase( {
	data,
	parentWidth,
	tooltipLeft, tooltipTop, tooltipData,
	hideTooltip, showTooltip
} ) {
	const texts = useStore( textsSelector )
	const height = 500
	const margin = { left: 30, top: 10 }

	// scales
	const xScale = scaleLinear( {
		range: [ 0, parentWidth - margin.left ],
		domain: [ 2010, 2040 ],
	} )

	const maxCO2 = max( data, d => ( d.oil1 ?? 0 ) + ( d.gas1 ?? 0 ) + ( d.oil3 ?? 0 ) + ( d.gas3 ?? 0 ) )
	const maxReservesCO2 = max( data, d =>
		( d.reserves_gas?.scope1 ?? 0 ) + ( d.reserves_gas?.scope3 ?? 0 ) + ( d.reserves_oil?.scope1 ?? 0 ) + ( d.reserves_oil?.scope3 ?? 0 ) )
	//console.log( { maxCO2, maxReservesCO2 } )

	const yScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2 ],
	} )

	const reservesScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxReservesCO2 ],
	} )

	// tooltip handler
	const bisectDate = bisector( d => {
		//console.log( 'bisectDate', d )
		return d.year
	} ).left
	const getValue = d => {
		//console.log( 'getValue', d )
		return d.oil1
	}

	const handleTooltip = useCallback(
		event => {
			const l = localPoint( event )
			const { x } = l || { x: 0 }
			const x0 = xScale.invert( x )
			const index = bisectDate( data, x0, 1 )
			const d0 = data[ index - 1 ]
			const d1 = data[ index ]
			let d = d0
			if( d1 && getX( d1 ) ) {
				d = x0.valueOf() - getX( d0 ).valueOf() > getX( d1 ).valueOf() - x0.valueOf() ? d1 : d0
			}
			//console.log( { d, v: getValue( d ), y: yScale( getValue( d ) ) } )
			showTooltip( {
				tooltipData: d,
				tooltipLeft: x,
				tooltipTop: yScale( getValue( d ) ),
			} )
		},
		[ showTooltip, yScale, xScale ],
	)

	return (
		<div>
			<svg width={'100%'} height={height}>
				<Group left={margin.left} top={0}>
					<AxisBottom
						top={height - 22}
						scale={xScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => `${x.toFixed( 0 )}`}
					/>

					<AxisLeft
						scale={yScale}
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
						data={data}
						defined={d => d.data.year >= 2010}
						x={d => {
							const x = xScale( getX( d.data ) ) ?? 0
							//console.log( { d, x } )
							return x
						}}
						y0={d => yScale( getY0( d ) ) ?? 0}
						y1={d => yScale( getY1( d ) ) ?? 0}
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
						data={data}
						defined={d => d.data.year >= 2010}
						x={d => {
							const x = xScale( getX( d.data ) ) ?? 0
							//console.log( { d, x } )
							return x
						}}
						y0={d => yScale( getY0( d ) ) ?? 0}
						y1={d => yScale( getY1( d ) ) ?? 0}
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
						data={data}
						defined={d => d.year >= 2010 && getOilReservesCO2( d ) > 0}
						x={d => xScale( getX( d ) ) ?? 0}
						y={d => reservesScale( getOilReservesCO2( d ) ) ?? 0}
						stroke={'#935050'}
						strokeWidth={2}
						strokeOpacity={1}
						shapeRendering="geometricPrecision"
					/>
					<LinePath
						curve={curveLinear}
						data={data}
						defined={d => d.year >= 2010 && getGasReservesCO2( d ) > 0}
						x={d => xScale( getX( d ) ) ?? 0}
						y={d => reservesScale( getGasReservesCO2( d ) ) ?? 0}
						stroke={'#799350'}
						strokeWidth={2}
						strokeOpacity={1}
						shapeRendering="geometricPrecision"
					/>

				</Group>

				<Bar
					x={margin.left}
					y={margin.top}
					width={parentWidth - margin.left}
					height={height - margin.top}
					fill="transparent"
					rx={14}
					onTouchStart={handleTooltip}
					onTouchMove={handleTooltip}
					onMouseMove={handleTooltip}
					onMouseLeave={() => hideTooltip()}
				/>

			</svg>
			{tooltipData && (
				<div>
					<TooltipWithBounds
						key={Math.random()}
						top={tooltipTop - 12}
						left={tooltipLeft + 12}
						style={{
							...defaultStyles,
							minWidth: 60,
							backgroundColor: 'rgba(0,0,0,0.9)',
							color: 'white'
						}}
					>
						<table>
							<tbody>
								<tr>
									<td>{texts?.oil} 1</td>
									<td align="right">{tooltipData.oil1?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.gas} 1</td>
									<td align="right">{tooltipData.gas1?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.oil} 3</td>
									<td align="right">{tooltipData.oil3?.toFixed( 1 )}</td>
								</tr>
								<tr>
									<td>{texts?.gas} 3</td>
									<td align="right">{tooltipData.gas3?.toFixed( 1 )}</td>
								</tr>
							</tbody>
						</table>
					</TooltipWithBounds>
				</div>
			)}
		</div> )
}

export default withParentSize( withTooltip( CO2ForecastGraphBase ) )

//#008080,#70a494,#b4c8a8,#f6edbd,#edbb8a,#de8a5a,#ca562c
/*
			<Group top={0} left={0}>
				<LinePath
					curve={curveLinear}
					data={data}
					x={d => xScale( getX( d ) ) ?? 0}
					y={d => yScale( getY( d ) ) ?? 0}
					stroke={'#935050'}
					strokeWidth={1.5}
					strokeOpacity={1}
					shapeRendering="geometricPrecision"
				/>
				<AreaClosed
					data={data}
					x={d => xScale( getX( d ) ) ?? 0}
					y={d => yScale( getY( d ) ) ?? 0}
					yScale={yScale}
					strokeWidth={1}
					stroke="url(#area-gradient)"
					fill={'#a1a35e'}
					fillOpacity={0.1}
					curve={curveLinear}
				/>
			</Group>

 */
