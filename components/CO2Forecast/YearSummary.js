import React from "react"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { addToTotal } from "./calculate"
import settings from "../../settings"
import ScopeBars from "../viz/ScopeBars"

const DEBUG = false

export default function YearSummary( { dataset = [] } ) {
	const { getText } = useText()
	const productionSourceId = useSelector( redux => redux.productionSourceId )

	if( !( dataset?.length > 0 ) ) return null

	const totals = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }

	let lastYearProd = {}
	dataset
		.filter( d => d.sourceId === productionSourceId )
		.forEach( d => lastYearProd[ d.fossilFuelType ] = d )

	settings.supportedFuels.forEach( fuel => addToTotal( totals, lastYearProd[ fuel ]?.co2 ?? 0 ) )

	DEBUG && console.log( { lastYearProd, productionSourceId, dataset } )

	let year = `(${ lastYearProd[ 'oil' ]?.year })`
	if( lastYearProd[ 'gas' ]?.year && ( lastYearProd[ 'oil' ]?.year !== lastYearProd[ 'gas' ]?.year ) ) // Different last year?
		year = `(${ lastYearProd[ 'oil' ]?.year } / ${ lastYearProd[ 'gas' ]?.year })`

	console.log( { totals } )

	return (
		<div className="table-wrap">
			<div className="top">
				{ getText( 'this_year' ) } { year } { getText( 'megaton' ) } CO²e
			</div>

			<div style={ { flexGrow: 1, minHeight: 400 } }>
				<ScopeBars totals={ totals }/>
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
		</div> )
}
