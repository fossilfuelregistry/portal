import React from "react"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { useConversionHooks } from "../viz/conversionHooks"
import { addToTotal, sumOfCO2 } from "./calculate"
import settings from "settings"
import SourceBars from "../viz/SourceBars"

const DEBUG = false

function FutureSummary( { dataset, limits, projectionSources } ) {
	const { getText } = useText()
	const { co2FromVolume } = useConversionHooks()
	const stableProduction = useSelector( redux => redux.stableProduction )
	const allSources = useSelector( redux => redux.allSources )
	const projectionSourceId = useSelector( redux => redux.projectionSourceId )

	if( !( dataset?.length > 0 ) ) return null
	if( !stableProduction.oil || !stableProduction.gas ) return null

	DEBUG && console.log( { projectionSourceId, allSources, limits, stableProduction } )

	const stable = {
		oil: co2FromVolume( stableProduction.oil ),
		gas: co2FromVolume( stableProduction.gas )
	}

	const projectionSource = allSources.find( s => s.sourceId === projectionSourceId )
	if( !projectionSource ) return null
	let sourceName = projectionSource?.name
	if( sourceName.startsWith( 'name_' ) ) sourceName = getText( sourceName )

	const year = dataset.reduce( ( yrs, datapoint ) => {
		yrs.first = Math.min( datapoint.year, yrs.first ?? 9999 )
		yrs.last = Math.max( datapoint.year, yrs.last ?? 0 )
		return yrs
	}, {} )
	year.first = Math.max( new Date().getFullYear(), year.first )
	const years = 1 + year.last - year.first

	const distinctSourceIds = {}
	const sources = ( projectionSources ?? [] )
		.filter( s => {
			if( s.sourceId === settings.stableProductionSourceId ) return false
			if( distinctSourceIds[ s.sourceId ] ) return false
			distinctSourceIds[ s.sourceId ] = true
			return true
		} )
		.map( source => {
			const sourceTotal = {
				oil: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] },
				gas: { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }
			}

			dataset
				.filter( d => d.sourceId === source.sourceId )
				.forEach( d => {
					if( d.year < year.first ) return
					addToTotal( sourceTotal[ d.fossilFuelType ], d.co2 )
				} )

			return { ...source, total: sourceTotal }
		} )

	DEBUG && console.log( { years, year, stable, dataset, sources } )

	return (
		<div className="table-wrap">

			<div className="top">
				{ getText( 'future_emissions' ) } { getText( 'megaton' ) } CO²e
			</div>

			<div style={ { flexGrow: 1, minHeight: 400 } }>
				<SourceBars
					sources={ [ ...sources, {
						sourceId: 100,
						name: 'name_projection_stable',
						total: [ 0, 1, 2 ].map( r => years * sumOfCO2( stable, r ) )
					} ] }
				/>
			</div>

			<style jsx>{ `
              .table-wrap {
                border: 1px solid #dddddd;
                border-radius: 8px;
                position: relative;
                display: flex;
                flex-direction: column;
                height: 100%;
              }

              .table-wrap :global(svg) {
                display: block;
              }

              .top {
                width: 100%;
                background-color: #eeeeee;
                padding: 3px 12px;
                font-weight: bold;
                text-align: center;
              }
			` }
			</style>
		</div>
	)
}

export default FutureSummary
