import CsvDownloader from "react-csv-downloader"
import React from "react"
import { sumOfCO2 } from "./calculate"
import { useSelector } from "react-redux"

export default function Download( { data, filename, fuel, children } ) {
	const allSources = useSelector( redux => redux.allSources )

	if( !data?.length > 0 ) return null

	// TODO only build data array when download clicked.

	const datas = data
		.filter( d => d.fossilFuelType === fuel )
		.map( d => {
			let _d = { ...d }
			delete _d.id
			delete _d.__typename
			delete _d.sourceId
			_d.source = allSources.find( s => s.sourceId === d.sourceId )?.name
			if( d.co2?.scope1 || d.co2?.scope3 ) {
				_d.co2 = sumOfCO2( d.co2, 1 )
			}
			return _d
		} )

	return (
		<div className="download">
			<CsvDownloader datas={ datas } filename={ filename }>
				{ children }
			</CsvDownloader>

			<style jsx>{ `
              .download {
                margin-top: 12px;
              }

              .download :global(button) {
                font-size: 16px;
              }
			` }
			</style>
		</div> )
}