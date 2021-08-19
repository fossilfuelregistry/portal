import React, { useMemo } from "react"
import { BarStack } from "@visx/shape"
import { Group } from "@visx/group"
import { withParentSize } from '@visx/responsive'
import { scaleBand, scaleLinear } from "@visx/scale"
import { max } from 'd3-array'
import RangeChartAxes from "./RangeChartAxes"
import getConfig from "next/config"
import { scaleOrdinal } from "@visx/visx"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const verticalMargin = 60
const horizontalMargin = 55

const getX = ( d ) => d.label
const getYtotal = ( d ) => Number( d.scope1 + d.scope3 ) // TODO Make more generic.

function BarStackInternal( { parentWidth, parentHeight, data, keys } ) {
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
		range: [ '#008080', '#de8a5a', '#b4c8a8' ]
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
								//console.log( bar )
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
											x={ bar.x + bar.width/2 }
											y={ bar.y + 20 }
											fill="#ffffff"
											fontSize={ 14 }
											fontWeight={ 'bold' }
											textAnchor="middle"
										>
											{ bar.bar.data[ bar.key ].toFixed( 1 ) }
										</text>
									</React.Fragment>
								) } ),
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
