import React, { useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import CountrySelector from "components/navigation/CountrySelector"
import { Col, Radio, Row } from "antd"
import useText from "lib/useText"
import { NextSeo } from "next-seo"
import { useDispatch, useSelector } from "react-redux"
import CarbonIntensitySelector from "components/viz/IntensitySelector"
import ReservesSelector from "components/viz/ReservesSelector"
import HelpModal from "../components/HelpModal"
import LoadData from "../components/CO2Forecast/LoadData"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const radioStyle = {
	display: 'block',
	height: '30px',
	lineHeight: '30px',
}

export default function CO2ForecastPage() {
	const { getText } = useText()
	const dispatch = useDispatch()
	const [ grades, set_grades ] = useState( {} )
	const [ projection, set_projection ] = useState( 'stable' )
	const [ productionSources, set_productionSources ] = useState( [] )
	const [ futureSources, set_futureSources ] = useState( [] )
	const [ selectedSource, set_selectedSource ] = useState()

	const country = useSelector( redux => redux.country )

	const title = ( country?.label ? country.label + ' - ' : '' ) + getText( 'co2_effects_for_country' )
	return (
		<>
			<NextSeo
				title={ title }
				description={ getText( 'a_service_from_gffr' ) }
				openGraph={ {
					url: 'https://grff.journeyman.se',
					title: getText( 'gffr' ),
					description: title,
					images: [
						{
							url: 'https://grff.journeyman.se/og1.jpg',
							width: 1200,
							height: 671,
							alt: getText( 'gffr' ),
						}
					],
					site_name: getText( 'gffr' ),
				} }
			/>

			<div className="page">
				<TopNavigation share={ true }/>

				<div className="co2">

					<Row gutter={ [ 12, 12 ] } style={ { marginBottom: 26 } }>

						<Col xs={ 12 } lg={ 6 }>
							<h3>{ getText( 'country' ) }</h3>
							<CountrySelector/>
						</Col>

						<Col xs={ 12 } lg={ 4 }>
							<h3>
								{ getText( 'data_source' ) }
								<HelpModal title="data_source" content="explanation_countryhistoric"/>
							</h3>
							<Radio.Group
								onChange={ e => {
									set_selectedSource( e.target.value )
									dispatch( { type: 'PRODUCTIONSOURCEID', payload: e.target.value } )
								} }
								value={ selectedSource }
							>
								{ productionSources.map( source => (
									<Radio style={ radioStyle } value={ source?.sourceId } key={ source?.sourceId }>
										{ source?.name }
									</Radio> ) ) }
							</Radio.Group>
						</Col>

						<Col xs={ 12 } lg={ 5 }>
							<h3>{ getText( 'reserves' ) }</h3>
							<ReservesSelector/>
						</Col>

						<Col xs={ 12 } lg={ 5 }>
							<div>
								<h3>
									{ getText( 'projection' ) }
								</h3>
								<Radio.Group onChange={ e => set_projection( e.target.value ) } value={ projection }>
									{ futureSources.map( source => (
										<Radio style={ radioStyle } value={ source?.sourceId } key={ source?.sourceId }>

											{ source?.name === 'trend' &&
											<>
												{ getText( 'trend' ) }
												<HelpModal
													title="projection"
													content="explanation_productioncountry_trend"
												/>
											</> }

											{ source?.name !== 'trend' &&
											<>
												{ source?.name }
												<HelpModal
													title="projection"
													content="explanation_countryproduction_sourced"
												/>
											</> }

										</Radio> ) ) }
									<Radio style={ radioStyle } value={ 'stable' }>
										{ getText( 'stable' ) }
										<HelpModal title="stable" content="explanation_productioncountry_stable"/>
									</Radio>
								</Radio.Group>
							</div>
						</Col>

						<Col xs={ 24 } md={ 12 } lg={ 4 }>
							<h3>
								{ getText( 'carbon_intensity' ) }
								<HelpModal title="carbon_intensity" content="explanation_methanefactor"/>
							</h3>
							<CarbonIntensitySelector/>
						</Col>

					</Row>

					<LoadData/>

				</div>

				<style jsx>{ `
                  .page {
                    padding-bottom: 20px;
                  }

                  .co2 {
                    padding: 0 40px;
                  }

                  @media (max-width: ${ theme[ '@screen-sm' ] }) {
                    .co2 {
                      padding: 0 18px;
                    }
                  }

                  h3 {
                    margin-bottom: 12px !important;
                  }

                  .co2 :global(.ant-slider-mark) {
                    top: 25px;
                  }

                  .co2 :global(.ant-slider-dot) {
                    height: 20px;
                    width: 20px;
                    top: -4px;
                    transform: translateX(-6.5px);
                  }
				` }
				</style>

			</div>
		</>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
