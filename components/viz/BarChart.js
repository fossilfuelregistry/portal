import React, { useMemo } from "react";
import { BarRounded } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from '@visx/text';
import { withParentSize } from '@visx/responsive'
import { scaleBand, scaleLinear } from "@visx/scale";
import RangeChartAxes from "./RangeChartAxes";
import getConfig from "next/config";

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const verticalMargin = 60
const horizontalMargin = 55

const getX = ( d ) => d.label;
const getY = ( d ) => Number( d.quantity );

function BarchartInternal( { parentWidth, parentHeight, data } ) {
	// bounds
	const xMax = parentWidth - horizontalMargin / 2; // divide by 2 to only add margin on left side
	const yMax = parentHeight - verticalMargin;

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
	);
	const yScale = useMemo(
		() =>
			scaleLinear( {
				range: [ yMax, 0 ],
				round: true,
				domain: [ 0, Math.max( ...data.map( getY ) ) ]
			} ),
		[ yMax, data ]
	);

	return parentWidth < 10 ? null : (
		<svg width={parentWidth} height={parentHeight}>
			<Group left={horizontalMargin / 2} top={verticalMargin / 2}>
				<RangeChartAxes
					xScale={xScale}
					yScale={yScale}
					width={xMax}
					height={yMax}
					yNumTicks={2}
					yTickLabelOffset={horizontalMargin / 2}
				/>
				{data.map( ( d, i ) => {
					const type = getX( d );
					const barWidth = xScale.bandwidth();
					const barHeight = yMax - ( yScale( getY( d ) ) ?? 0 );
					const barX = xScale( type );
					const barY = yMax - barHeight;

					const barCenterX = barX + barWidth / 2
					const aboveBarY = barY - 7
					return (
						// eslint-disable-next-line react/no-array-index-key
						<React.Fragment key={`bar-${type}-${i}`}>
							<Text
								x={barCenterX}
								y={aboveBarY}
								width={900}
								verticalAnchor="end"
								textAnchor="middle"
								fill={theme[ '@text-grey' ]}
								fontSize={14}
								fontWeight={600}
							>
								{d.quantity}
							</Text>
							<BarRounded
								x={barX}
								y={barY}
								width={barWidth}
								height={barHeight}
								radius={4}
								top
								fill={theme[ '@primary-color' ]}
							/>
						</React.Fragment>
					);
				} )}
			</Group>
		</svg>
	);
}

const BarChart = withParentSize( BarchartInternal )
export default BarChart
