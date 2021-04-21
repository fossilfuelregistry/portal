import React, { useMemo } from "react"
import { Group } from '@visx/group'
import { LinePath } from '@visx/shape'
import { AxisBottom, AxisRight } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import { max, min } from 'd3-array'
import { withParentSize } from "@visx/responsive"
import { getFuelCO2 } from "./util"

const DEBUG = false

//#008080,#70a494,#b4c8a8,#f6edbd,#edbb8a,#de8a5a,#ca562c

function ProductionGraphBase( {
	data, table, fuel, estimate, parentWidth, height = 300
} ) {
	const margin = { left: 0, top: 10 }

	const getYear = d => d.year
	const getY = d => getFuelCO2( d[ table ][ fuel ], estimate )

	// scales
	const yearScale = scaleLinear( {
		range: [ 0, parentWidth - margin.left ],
		domain: [ min( data, getYear ), 2021 ],
	} )

	const maxCO2 = useMemo( () => {
		let maxValue = max( data, d => getY( d ) )
		DEBUG && console.log( { maxValue } )
		return maxValue
	}, [ data ] )

	const yScale = scaleLinear( {
		range: [ height - 30, 0 ],
		domain: [ 0, maxCO2 ],
	} )

	if( !( data?.length > 0 ) ) return '...pending'

	return (
		<div className="graph">
			<svg width={'100%'} height={height}>
				<Group left={margin.left} top={0}>
					<AxisBottom
						top={height - 30}
						scale={yearScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => `${x.toFixed( 0 )}`}
					/>

					<AxisRight
						scale={yScale}
						numTicks={parentWidth > 520 ? 8 : 4}
						tickFormat={x => x.toFixed( 1 ).toString()}
					/>

					<LinePath
						curve={curveLinear}
						className="curve"
						data={data}
						x={d => yearScale( getYear( d ) ) ?? 0}
						y={d => yScale( getY( d ) ) ?? 0}
						shapeRendering="geometricPrecision"
					/>

				</Group>

			</svg>

			<style jsx>{`
              :global(path.curve) {
                stroke: #333333;
                stroke-width: 3;
              }
			`}
			</style>
		</div> )
}

export default withParentSize( ProductionGraphBase )
