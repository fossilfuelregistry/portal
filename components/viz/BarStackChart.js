import React, { useMemo } from "react"
import { BarStack } from "@visx/shape"
import { Group } from "@visx/group"
import { withParentSize } from '@visx/responsive'
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import { max } from 'd3-array'
import RangeChartAxes from "./RangeChartAxes"
import getConfig from "next/config"
import useText from "lib/useText"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const verticalMargin = 60
const horizontalMargin = 55

const getX = ( d ) => d.label
const getYtotal = ( d ) => Number( d.scope1 + d.scope3 ) // TODO Make more generic.

function BarStackInternal( { parentWidth, parentHeight, data, keys } ) {
	const { getText } = useText()

	// bounds
	const xMax = parentWidth - horizontalMargin / 2 // divide by 2 to only add margin on left side
	const yMax = parentHeight - verticalMargin

	// scales, memoize for performance
	const xScale = useMemo(
		() =>
			scaleBand( {
				range: [ 0, xMax ],
				round: true,
				domain: data.map( getX ),
				padding: 0.2
			} ),
		[ xMax, data ]
	)

	const yTotalMax = max( data.map( getYtotal ) )

	const yScale = useMemo(
		() =>
			scaleLinear( {
				range: [ yMax, 0 ],
				round: true,
				domain: [ 0, yTotalMax ]
			} ),
		[ yTotalMax, data ]
	)

	const colorScale = scaleOrdinal( {
		domain: keys,
		range: Object.keys( theme ).filter( k => k.startsWith( '@grff-bars2' ) ).map( k => theme[ k ] )
	} )

	return parentWidth < 10 ? null : (
		<svg width={ parentWidth } height={ parentHeight }>
			<Group left={ horizontalMargin / 2 } top={ verticalMargin / 2 }>
				<BarStack
					data={ data }
					keys={ keys }
					x={ d => d.label }
					xScale={ xScale }
					yScale={ yScale }
					color={ colorScale }
				>
					{ barStacks =>
						barStacks.map( barStack =>
							barStack.bars.map( bar => {
								const tx = bar.x + bar.width / 2
								return (
									<React.Fragment key={ `bar-stack-${ barStack.index }-${ bar.index }` }>
										<rect
											x={ bar.x }
											y={ bar.y }
											height={ bar.height }
											width={ bar.width }
											fill={ bar.color }
										/>
										<text
											x={ tx }
											y={ bar.y + ( bar.key === 'scope1' ? -17 : 17 ) }
											fill={ bar.key === 'scope1' ? theme[ '@text-color' ] : "#ffffff" }
											fontSize={ 14 }
											fontWeight={ 'bold' }
											textAnchor="middle"
										>
											<tspan x={ tx }>{ bar.bar.data[ bar.key ]?.toFixed( 1 ) }</tspan>
											<tspan x={ tx } dy={ 14 }>{ getText( bar.key ) }</tspan>
										</text>

										{bar.key === 'scope3' &&
										<text
											x={ tx }
											y={ bar.y + bar.height - 10 }
											fill={ "#ffffff" }
											fontSize={ 14 }
											fontWeight={ 'bold' }
											textAnchor="middle"
										>
											{ ( bar.bar.data.scope1 + bar.bar.data.scope3 )?.toFixed( 1 ) }
										</text> }

									</React.Fragment>
								)
							} ),
						)
					}
				</BarStack>
				<RangeChartAxes
					xScale={ xScale }
					yScale={ yScale }
					width={ xMax }
					height={ yMax }
					yNumTicks={ 2 }
					yTickLabelOffset={ horizontalMargin / 2 }
				/>
			</Group>
		</svg>
	)
}

const BarStackChart = withParentSize( BarStackInternal )
export default BarStackChart
