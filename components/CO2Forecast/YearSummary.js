import React, { useEffect } from "react"
import useText from "lib/useText"
import { useSelector } from "react-redux"
import { addToTotal } from "./calculate"
import settings from "../../settings"
import ScopeBars from "../viz/ScopeBars"
import { DownloadOutlined } from "@ant-design/icons"
import CsvDownloader from "react-csv-downloader"
import { Col, Row } from "antd"
import HelpModal from "../HelpModal"
import useCsvDataTranslator from "lib/useCsvDataTranslator"
import useCO2CostConverter from "lib/useCO2CostConverter"


const DEBUG = true

export default function YearSummary( { dataset = [] } ) {
	const { getText } = useText()
	const { generateCsvTranslation } = useCsvDataTranslator()
	const country = useSelector( redux => redux.country )
	const productionSourceId = useSelector( redux => redux.productionSourceId )
	const { currentUnit, costMultiplier } = useCO2CostConverter()

	if( !( dataset?.length > 0 ) ) return null

	const totals = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }

	let lastYearProd = {}
	dataset
		.filter( d => d.sourceId === productionSourceId )
		.forEach( d => lastYearProd[ d.fossilFuelType ] = d )

	settings.supportedFuels.forEach( fuel => addToTotal( totals, lastYearProd[ fuel ]?.co2 ?? 0 ) )

	DEBUG && console.info( { lastYearProd, productionSourceId, dataset } )

	let year = `(${ lastYearProd[ 'oil' ]?.year })`
	if( lastYearProd[ 'gas' ]?.year && ( lastYearProd[ 'oil' ]?.year !== lastYearProd[ 'gas' ]?.year ) ) // Different last year?
		year = `(${ lastYearProd[ 'oil' ]?.year } / ${ lastYearProd[ 'gas' ]?.year })`


	DEBUG && console.info( { totals, csvData } )

	let totalsInCO2OrCurrency = JSON.parse( JSON.stringify( totals ) )
	let csvData = []
	
	Object.entries( totals ).forEach( entry => totalsInCO2OrCurrency[ entry[ 0 ] ] = entry[ 1 ].map( v => v * costMultiplier ) )


	csvData = [ {
		scope1_low: totalsInCO2OrCurrency.scope1[ 0 ],
		scope1_mid: totalsInCO2OrCurrency.scope1[ 1 ],
		scope1_high: totalsInCO2OrCurrency.scope1[ 2 ],
		scope3_low: totalsInCO2OrCurrency.scope3[ 0 ],
		scope3_mid: totalsInCO2OrCurrency.scope3[ 1 ],
		scope3_high: totalsInCO2OrCurrency.scope3[ 2 ]
	} ]
	DEBUG && console.info( { csvData } )


	const translatedCsvData = csvData.map( generateCsvTranslation )


	return (
		<div className="table-wrap">
			<div className="top">
				<Row gutter={ 12 } style={ { display: 'inline-flex' } }>
					<Col>
						{ `${getText( 'now_heading' )} (${getText( 'megaton' )} ${currentUnit })`}
					</Col>
					<Col>
						<CsvDownloader
							datas={ translatedCsvData }
							filename={ country + '_year_emissions.csv' }
						>
							<DownloadOutlined/>
						</CsvDownloader>
					</Col>
					<Col>
						<HelpModal title="now_heading" content="now_heading_explanation"/>
					</Col>
				</Row>
			</div>

			<div style={ { flexGrow: 1, minHeight: 400 } }>
				<ScopeBars totals={ totalsInCO2OrCurrency }/>
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
                margin: 0 auto;
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
