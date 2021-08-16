import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import getConfig from "next/config";

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const axisTickLabelProps =  {
	fontSize: 12,
	fill: theme[ '@text-grey' ],
}

const axisTickLabelPropsY = ( yTickLabelOffset )  => ( {
	dy: 3.5,
	dx: ( -yTickLabelOffset / 4 ) * 3
} )

const ChartAxes = ( { xScale, yScale, width, height, yNumTicks, yTickLabelOffset } ) => {

	const xNumTicks = width > 460 ? 6 : width > 370 ? 5 : 4

	return (
		<>
			<GridRows scale={yScale} numTicks={yNumTicks} width={width} height={height} stroke={theme[ '@cf-borders' ]} />
			<AxisLeft
				scale={yScale}
				numTicks={yNumTicks}
				strokeWidth={0}
				tickLength={yTickLabelOffset/4}
				tickStroke={theme[ '@cf-borders' ]}
				tickLabelProps={() => ( { ...axisTickLabelProps, ...axisTickLabelPropsY( yTickLabelOffset ) } )}
			/>
			<AxisBottom
				scale={xScale}
				top={height}
				stroke={theme[ '@cf-borders' ]}
				tickStroke={theme[ '@cf-borders' ]}
				tickLabelProps={() => ( { ...axisTickLabelProps, textAnchor: 'middle' } )}
				numTicks={xNumTicks}
			/>
		</>
	)
}

export default ChartAxes
