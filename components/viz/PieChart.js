import React from "react"
import { Pie } from "@visx/shape"
import { Group } from "@visx/group"
import { withParentSize } from '@visx/responsive'
import { Tooltip, useTooltip } from "@visx/tooltip"

const margin = 34, whiteSpace = 3, outerLabel = 1.4, innerLabel = 1.0

const PieChartInternal = ( { parentWidth, parentHeight, data, header, topNote, note } ) => {

	const {
		tooltipOpen,
		tooltipLeft,
		tooltipTop,
		tooltipData,
		hideTooltip,
		showTooltip
	} = useTooltip()

	const minimumSize = Math.min( parentHeight, parentWidth )
	const radius = minimumSize / 2 - margin
	//const pieSortValues = ( a, b ) => b - a

	return (
		<>
			<svg width={ parentWidth } height={ parentHeight }>
				<Group top={ parentHeight / 2 } left={ parentWidth / 2 }>
					<Pie
						data={ data }
						pieValue={ ( d ) => d.percentage }
						outerRadius={ radius }
						innerRadius={ 0.6 * radius }
					>
						{ ( pie ) => {
							return pie.arcs.map( ( arc ) => {
								const [ centroidX, centroidY ] = pie.path.centroid( arc )
								const textPosX = centroidX > 0 ? centroidX * outerLabel + whiteSpace : centroidX < 0 ? centroidX * outerLabel - whiteSpace : centroidX
								const textPosY = centroidY > 0 ? centroidY * outerLabel + whiteSpace : centroidY < 0 ? centroidY * outerLabel - whiteSpace : centroidY
								const labelPosX = centroidX > 0 ? centroidX * innerLabel + whiteSpace : centroidX < 0 ? centroidX * innerLabel - whiteSpace : centroidX
								const labelPosY = centroidY > 0 ? centroidY * innerLabel + whiteSpace : centroidY < 0 ? centroidY * innerLabel - whiteSpace : centroidY
								const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1
								const arcPath = pie.path( arc )
								const arcFill = arc.data.fillColor
								return (
									<g key={ `arc-${ arc.data.label }` }>
										<path
											d={ arcPath }
											fill={ arcFill }
											onMouseLeave={ () => {
												hideTooltip()
											} }
											onMouseEnter={ () => {
												//console.log( { tooltipTop, tooltipLeft, centroidX, centroidY } )
												showTooltip( {
													tooltipLeft: labelPosX + parentWidth / 2,
													tooltipTop: labelPosY - parentHeight / 2,
													tooltipData: arc.data
												} )
											} }
										/>
									</g>
								)
							} )
						} }
					</Pie>
				</Group>
				<Group top={ parentHeight / 2 } left={ parentWidth / 2 }>
					<text
						x={ 0 }
						y={ 20 }
						fill="#000000d7"
						fontSize={ 60 }
						fontFamily={ 'sommet-rounded' }
						fontWeight={ 'bold' }
						textAnchor="middle"
					>
						{ header }
					</text>
					<text
						x={ 0 }
						y={ 40 }
						fill="#000000d7"
						fontSize={ 16 }
						fontWeight={ 'bold' }
						textAnchor="middle"
					>
						{ note }
					</text>
					<text
						x={ 0 }
						y={ -35 }
						fill="#000000d7"
						fontSize={ 16 }
						fontWeight={ 'bold' }
						textAnchor="middle"
					>
						{ topNote }
					</text>

				</Group>
			</svg>
			{ tooltipData && tooltipOpen && (
				<Tooltip style={ {
					transition: 'all 0.2s ease',
					transform: `translate(calc(${ tooltipLeft }px - 50%), calc(${ tooltipTop }px - 50%))`,
					backgroundColor: 'rgba(0,0,0,0.5',
					borderRadius: 8,
					padding: 12,
					color: '#ffffff',
					fontSize: '14px',
					fontWeight: 'bold',
					display: 'inline-block',
					pointerEvents: 'none'
				} }
				>
					{ tooltipData.label }<br/>
					{ tooltipData.quantity?.toFixed( 1 ) } ({ tooltipData.year })
				</Tooltip>
			) }
		</>
	)
}

const PieChart = withParentSize( PieChartInternal )

export default PieChart
