import React from "react"
import { Pie } from "@visx/shape"
import { Group } from "@visx/group"
import { withParentSize } from '@visx/responsive'
import { useTooltip } from '@visx/tooltip'

const margin = 34, whiteSpace = 3, outerLabel = 2.2, innerLabel = 1.5

const PieChartInternal = ( { parentWidth, parentHeight, data, header, topNote, note } ) => {

	const {
		hideTooltip,
		showTooltip
	} = useTooltip()

	const minimumSize = Math.min( parentHeight, parentWidth )
	const radius = minimumSize / 2 - margin
	const pieSortValues = ( a, b ) => b - a
	console.log( { parentHeight, minimumSize, radius } )
	return (
		<>
			<svg width={ parentWidth } height={ parentHeight }>
				<Group top={ parentHeight / 2 } left={ parentWidth / 2 }>
					<Pie
						data={ data }
						pieValue={ ( d ) => d.percentage }
						pieSortValues={ pieSortValues }
						outerRadius={ radius }
						centroid={ ( ( xyCoords, arc ) => 'XXX' ) }
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
											onMouseLeave={ hideTooltip }
											onMouseEnter={ () => {
												showTooltip( {
													tooltipLeft: ( ( parentWidth / 2 ) + 20 ) + textPosX,
													tooltipTop: ( parentHeight / 2 ) + textPosY,
													tooltipData: arc.data
												} )
											} }
										/>
										{ hasSpaceForLabel && (
											<text
												x={ textPosX }
												y={ textPosY }
												dy=".33em"
												fill="#757575"
												fontSize={ 14 }
												fontWeight={ 'bold' }
												textAnchor="middle"
												pointerEvents="none"
											>
												{ arc.data.quantity.toFixed( 1 ) }
											</text>
										) }
										{ hasSpaceForLabel && (
											<text
												x={ labelPosX }
												y={ labelPosY }
												dy="0"
												fill="#ffffff"
												fontSize={ 14 }
												fontWeight={ 'bold' }
												textAnchor="middle"
												pointerEvents="none"
											>
												{ arc.data.label.toUpperCase() }
											</text>
										) }
									</g>
								)
							} )
						} }
					</Pie>
				</Group>
				<Group top={ parentHeight / 2 } left={ parentWidth / 2 }>
					<text
						x={ 0 }
						y={ 10 }
						fill="#ffffff"
						fontSize={ 60 }
						fontFamily={ 'sommet-rounded' }
						fontWeight={ 'bold' }
						textAnchor="middle"
					>
						{ header }
					</text>
					<text
						x={ 0 }
						y={ 30 }
						fill="#ffffff"
						fontSize={ 16 }
						fontWeight={ 'bold' }
						textAnchor="middle"
					>
						{ note }
					</text>
					<text
						x={ 0 }
						y={ -45 }
						fill="#ffffff"
						fontSize={ 16 }
						fontWeight={ 'bold' }
						textAnchor="middle"
					>
						{ topNote }
					</text>

				</Group>
			</svg>
		</>
	)
}

const PieChart = withParentSize( PieChartInternal )

export default PieChart
