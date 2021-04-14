import React from 'react'
import { AreaStack } from '@visx/shape'
import { SeriesPoint } from '@visx/shape/lib/types'
import { GradientOrangeRed } from '@visx/gradient'
import { ParentSize } from '@visx/responsive'
import browserUsage, { BrowserUsage } from '@visx/mock-data/lib/mocks/browserUsage'
import { scaleLinear, scaleTime } from '@visx/scale'
import { timeParse } from 'd3-time-format'

type BrowserNames = keyof BrowserUsage;

const data = browserUsage
const keys = (Object.keys( data[ 0 ] ).filter( k => k !== 'date' ) as BrowserNames[]).filter( k => k !== 'Google Chrome')
const parseDate = timeParse( '%Y %b %d' )
export const background = '#f38181'

const getDate = ( d: BrowserUsage ) => ( parseDate( d.date ) as Date ).valueOf()
const getY0 = ( d: SeriesPoint<BrowserUsage> ) => d[ 0 ] / 100
const getY1 = ( d: SeriesPoint<BrowserUsage> ) => d[ 1 ] / 100

export type StackedAreasProps = {
	width: number;
	height: number;
	events?: boolean;
	margin?: { top: number; right: number; bottom: number; left: number };
};

function Example( {
					  width,
					  height,
					  margin = { top: 0, right: 0, bottom: 0, left: 0 },
					  events = false,
				  }: StackedAreasProps ) {
	// bounds
	const yMax = height - margin.top - margin.bottom
	const xMax = width - margin.left - margin.right

	// scales
	const xScale = scaleTime<number>( {
		range: [ 0, xMax ],
		domain: [ Math.min( ...data.map( getDate ) ), Math.max( ...data.map( getDate ) ) ],
	} )
	const yScale = scaleLinear<number>( {
		range: [ yMax, 0 ],
	} )

	//console.log(data)

	return width < 10 ? null : (
		<svg width={ width } height={ height }>
			<GradientOrangeRed id="stacked-area-orangered"/>
			<AreaStack
				top={ margin.top }
				left={ margin.left }
				keys={ keys }
				data={ data }
				x={ d => xScale( getDate( d.data ) ) ?? 0 }
				y0={ d => yScale( getY0( d ) ) ?? 0 }
				y1={ d => yScale( getY1( d ) ) ?? 0 }
			>
				{ ( { stacks, path } ) =>
					stacks.map( stack => {
						console.log( { stack, path })
							return (
								<path
									key={ `stack-${ stack.key }` }
									d={ path( stack ) || '' }
									stroke="transparent"
									fill="url(#stacked-area-orangered)"
									onClick={ () => {
										if( events ) alert( `${ stack.key }` )
									} }
								/>
							)
						}
					) }

			</AreaStack>
		</svg>
	)
}

export default function() {
	return ( <ParentSize>{ ( { width, height } ) => <Example width={ width } height={ 600 }/> }</ParentSize> )
}
