import React from "react"
import { Pie } from "@visx/shape"
import { Group } from "@visx/group"
import { withParentSize } from '@visx/responsive'
import { Tooltip, useTooltip } from "@visx/tooltip"
import { Glyph } from '@visx/glyph'

const margin = 34, whiteSpace = 3, outerLabel = 1.4, innerLabel = 1.0

const GlyphGas = ( { left, top, size } ) => (
	<Glyph left={ left } top={ top } size={ size }>
		<g transform="scale(0.8)">
			<path
				className="gas glyph"
				d="M10.1-2.8C9.1-8.5,6.9-13,4.7-16.3c-0.9-1.4-3.1-3.9-4.2-4.9l0,0h0c0-0.1-0.1-0.1-0.1-0.1C0.2-21.3,0-21.2,0-21v0
	c0.1,1.9,0.1,6.7-3.2,12.2C-5.9-4.4-8.5-0.1-9.4,4.5c-0.2,1.3-0.4,2.7-0.4,4.1c0,6.4,3,11.9,7.3,14.5l0,0c0.5,0.3,0.9,0.5,1.2,0.6
	c0,0,0.1,0,0.1,0c0.1,0,0.3-0.1,0.3-0.3c0-0.1,0-0.1-0.1-0.2c-1.7-1.6-2.8-4.8-2.8-8.6C-3.8,7,0,3.1,0,3.1s6.3,4.3,3.2,12.6l0,0
	c0,0,0,0,0,0.1c0,0.1,0.1,0.3,0.3,0.3c0,0,0,0,0,0c2-0.5,4.4-4.4,4.4-4.4l0,0C10,8.5,11.3,4,10.1-2.8z"
			/>
		</g>
	</Glyph>
)

const GlyphOil = ( { left, top, size } ) => (
	<Glyph left={ left } top={ top } size={ size }>
		<g transform="scale(0.7)">
			<path
				className="oil glyph"
				d="M11.4,1.4C10-9-1.9-24-1.9-24s-12,15-13.3,25.4c-0.1,0.4-0.1,2-0.1,2.1c0.1,7.3,6.1,13.2,13.4,13.2c7.4,0,13.5-6,13.5-13.5
	C11.5,3.2,11.4,1.9,11.4,1.4z M-3.8,10.9c-1.2,1.5-4.3,0.8-5.7-0.8c-1.3-1.5-2.3-3.6-2.5-5.9c-1-4.9,4.2-12.4,4.2-12.4
	C-7.8-2.7-6.8,0-6.2,1.5c0.6,1.6,2,3.7,2.9,5.4C-2.4,8.5-2.7,10.2-3.8,10.9z"
			/>
		</g>
	</Glyph>
)

const GlyphCoal = ( { left, top, size } ) => (
	<Glyph left={ left } top={ top } size={ size }>
		<g transform="scale(0.5)">
			<polygon className="coal glyph" points="0.9,-0.4 -21.5,-10.8 -27.9,6.9 -14.5,21.4 	"/>
			<polygon className="coal glyph" points="12.4,15.8 4,2.8 -10.4,23.3 14.7,26.1 	"/>
			<polygon className="coal glyph" points="2.1,-4.7 2.8,-22.3 -17.7,-13.9 	"/>
			<polygon className="coal glyph" points="6.5,-4 22,-6.7 7.1,-20.7 	"/>
			<polygon className="coal glyph" points="7.6,0.3 15.9,13.1 26.6,16.8 24.4,-2.7 	"/>
			<polygon className="coal glyph" points="17.5,18.3 18.9,24.9 24.6,20.7 	"/>
		</g>
	</Glyph>
)

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
						cornerRadius={ 3 }
						padAngle={ 0.005 }
					>
						{ ( pie ) => {
							return pie.arcs.map( ( arc ) => {
								const [ centroidX, centroidY ] = pie.path.centroid( arc )
								const textPosX = centroidX > 0 ? centroidX * outerLabel + whiteSpace : centroidX < 0 ? centroidX * outerLabel - whiteSpace : centroidX
								const textPosY = centroidY > 0 ? centroidY * outerLabel + whiteSpace : centroidY < 0 ? centroidY * outerLabel - whiteSpace : centroidY
								const labelPosX = centroidX > 0 ? centroidX * innerLabel + whiteSpace : centroidX < 0 ? centroidX * innerLabel - whiteSpace : centroidX
								const labelPosY = centroidY > 0 ? centroidY * innerLabel + whiteSpace : centroidY < 0 ? centroidY * innerLabel - whiteSpace : centroidY
								const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.15
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
										{ hasSpaceForLabel && arc.data.fuel === 'coal' &&
										<GlyphCoal top={ labelPosY } left={ labelPosX }/> }
										{ hasSpaceForLabel && arc.data.fuel === 'gas' &&
										<GlyphGas top={ labelPosY } left={ labelPosX }/> }
										{ hasSpaceForLabel && arc.data.fuel === 'oil' &&
										<GlyphOil top={ labelPosY } left={ labelPosX }/> }
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
