import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import getConfig from "next/config";
import React from "react"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const axisTickLabelProps =  {
	fontSize: 14,
	fontWeight: 'bold',
	fill: '#ffffff'
}

const axisTickLabelPropsY = ( yTickLabelOffset )  => ( {
	dy: 3.5,
	dx: ( -yTickLabelOffset / 4 ) * 3
} )

const RangeChartAxes = ( { xScale, yScale, width, height, yNumTicks, yTickLabelOffset } ) => {

	const xNumTicks = width > 460 ? 6 : width > 370 ? 5 : 4

	return (
		<>
			<AxisBottom
				scale={xScale}
				top={ height - 50}
				hideAxisLine={true}
				hideTicks={true}
				tickStroke={theme[ '@cf-borders' ]}
				tickLabelProps={() => ( { ...axisTickLabelProps, textAnchor: 'middle' } )}
				numTicks={xNumTicks}
			/>
		</>
	)
}

export default RangeChartAxes
