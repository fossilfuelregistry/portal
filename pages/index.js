import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import dynamic from "next/dynamic"
import { Alert, Button, Col, Modal, Radio, Row, Slider } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/router"
import useText from "lib/useText"
import { NextSeo } from "next-seo"
import { findLastProductionYear, findLastReservesYear, getFuelCO2 } from "components/viz/util"
import { useConversionHooks } from "../components/viz/conversionHooks"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const GlobeNoSSR = dynamic( () => import( "components/geo/GlobeNoSSR" ),
	{ ssr: false } )

export default function Home() {
	const router = useRouter()
	const { getText } = useText()
	const [ year, set_year ] = useState( 2019 )
	const [ country, set_country ] = useState( undefined )
	const [ modalData, set_modalData ] = useState( undefined )
	const [ tooltipVisible, set_tooltipVisible ] = useState( false )
	const [ dataKeyName, set_dataKeyName ] = useState( 'production' )
	const { co2FromVolume } = useConversionHooks()

	const handleChangeKeyName = useCallback( event => {
		set_dataKeyName( event.target.value )
	}, [] )

	useEffect( () => {
		if( country ) {
			const data = {}
			// Arbitrarily pick EIA source
			data.production = country.countryProductionsByIso3166?.nodes?.filter( p => p.sourceId === 2 ) ?? {}
			data.reserves = country.countryReservesByIso3166?.nodes?.filter( p => p.sourceId === 2 ) ?? {}
			if( data.production.length > 0 ) {
				const lastProd = findLastProductionYear( data.production, 2 )
				const lastRes = findLastReservesYear( data.reserves )
				DEBUG && console.log( { lastProd, lastRes } )
				if( !!lastProd.yearData[ 0 ] && !!lastRes.yearData[ 0 ] ) {
					data.countryProd = getFuelCO2( co2FromVolume( lastProd.yearData[ 0 ] ), 2 )
						+ getFuelCO2( co2FromVolume( lastProd.yearData[ 1 ] ), 2 )
					data.countryRes = getFuelCO2( co2FromVolume( lastRes.yearData[ 0 ] ), 2 )
						+ getFuelCO2( co2FromVolume( lastRes.yearData[ 1 ] ), 2 )
					DEBUG && console.log( data )
					set_modalData( data )
				}
			}
		}
	}, [ country ] )

	return (
		<div className="page">

			<NextSeo
				title={getText( 'gffr' )}
				description={getText( 'fossil_fuel_prod_reserves' )}
				openGraph={{
					url: 'https://gffr.journeyman.se',
					title: getText( 'gffr' ),
					description: getText( 'fossil_fuel_prod_reserves' ),
					images: [
						{
							url: 'https://gffr.journeyman.se/og1.jpg',
							width: 1200,
							height: 671,
							alt: getText( 'gffr' ),
						}
					],
					site_name: getText( 'gffr' ),
				}}
			/>

			<TopNavigation/>

			<div className="aspect-order">
				<div className="content-block globe-controls aspect-controlled">
					<Row gutter={[ 4, 12 ]}>
						<Col xs={24} md={16}>
							<Slider
								trackStyle={{ height: '12px' }}
								railStyle={{ height: '12px' }}
								handleStyle={{ height: '22px', width: '22px' }}
								tooltipVisible={tooltipVisible}
								min={1970}
								max={2021}
								onChange={set_year}
								value={year}
							/>
						</Col>
						<Col xs={24} md={8} style={{ textAlign: 'center' }}>
							<Radio.Group
								options={[
									{ label: 'PRODUCTION', value: 'production' },
									{ label: 'RESERVES', value: 'reserves' },
								]}
								onChange={handleChangeKeyName}
								value={dataKeyName}
								optionType="button"
								buttonStyle="solid"
							/>
						</Col>
					</Row>
				</div>

				<div className="content-block">
					<GlobeNoSSR
						onGlobeReady={() => set_tooltipVisible( true )}
						onCountryClick={set_country}
						year={year}
						dataKeyName={dataKeyName}
					/>
				</div>
			</div>

			{!!country &&
			<Modal
				visible={country?.name?.length > 0}
				onCancel={() => set_country( undefined )}
				footer={null}
			>
				<h1>{country?.name}</h1>

				{modalData?.countryProd > 0 &&
				<table>
					<tbody>
						<tr>
							<td>{getText( 'population' )} &nbsp;</td>
							<td align="right">{Math.round( country.popEst / 1000000 )}</td>
							<td>M</td>
						</tr>
						<tr>
							<td>{getText( 'production' )} {year}&nbsp;&nbsp;</td>
							<td align="right">{modalData.countryProd?.toFixed( 1 )}</td>
							<td>M Tons CO²</td>
						</tr>
						<tr>
							<td>{getText( 'reserves' )} {year}&nbsp;&nbsp;</td>
							<td align="right">{modalData.countryRes?.toFixed( 1 )}</td>
							<td>M Tons CO²</td>
						</tr>
					</tbody>
				</table>}

				{!modalData &&
				<Alert type="warning" showIcon message="EIA Production unavailable"/>}

				<Button
					type="primary"
					block style={{ marginTop: 24 }}
					onClick={() => {
						set_country( undefined )
						router.push( 'co2-forecast/' + country.isoA2?.toLowerCase() )
					}}
				>
					{getText( 'goto_co2_forecast' )}
				</Button>

			</Modal>}

			<style jsx>{`
              .aspect-order {
                display: flex;
                flex-direction: column;
              }

              @media (max-aspect-ratio: 1/1) {
                .aspect-controlled {
                  order: 3;
                }
              }

			`}
			</style>

		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
