import React from "react"
import { Pie } from "@visx/shape"
import { Group } from "@visx/group"
import { withParentSize } from '@visx/responsive'
import { useTooltip } from '@visx/tooltip'

const margin = 34, whiteSpace = 3

const PieChartInternal = ( { parentWidth, parentHeight, data } ) => {

	const {
		hideTooltip,
		showTooltip
	} = useTooltip()

	const minimumSize = Math.min( parentHeight, parentWidth )
	const radius = minimumSize / 2 - margin
	const pieSortValues = ( a, b ) => b - a

	return (
		<>
			<svg width={parentWidth} height={parentHeight}>
				<Group top={parentHeight/2} left={parentWidth/2}>
					<Pie
						data={data}
						pieValue={( d ) => d.percentage}
						pieSortValues={pieSortValues}
						outerRadius={radius}
					>
						{( pie ) => {
							return pie.arcs.map( ( arc ) => {
								const [ centroidX, centroidY ] = pie.path.centroid( arc )
								const textPosX = centroidX > 0 ? centroidX * 2.3 + whiteSpace : centroidX < 0 ? centroidX * 2.3 - whiteSpace : centroidX
								const textPosY = centroidY > 0 ? centroidY * 2.3 + whiteSpace : centroidY < 0 ? centroidY * 2.3 - whiteSpace : centroidY
								const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1
								const arcPath = pie.path( arc )
								const arcFill = arc.data.fillColor
								return (
									<g key={`arc-${arc.data.label}`}>
										<path 
											d={arcPath} 
											fill={arcFill}
											onMouseLeave={hideTooltip}
											onMouseEnter={() => {
												showTooltip( {
													tooltipLeft: ( ( parentWidth / 2 ) + 20 )  + textPosX,
													tooltipTop: ( parentHeight / 2 ) + textPosY,
													tooltipData: arc.data
												} )
											}}			
										/>
										{hasSpaceForLabel && (
											<text
												x={textPosX}
												y={textPosY}
												dy=".33em"
												fill="#757575"
												fontSize={14}
												textAnchor="middle"
												pointerEvents="none"
											>
												{arc.data.percentage}%
											</text>
										)}
									</g>
								)
							} )
						}}
					</Pie>
				</Group>
			</svg>
		</>
	)
}

const PieChart =  withParentSize( PieChartInternal )

export default PieChart
