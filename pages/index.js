import TopNavigation from "components/navigation/TopNavigation"
import dynamic from "next/dynamic"
import { Button, Col, Modal, notification, Row } from "antd"
import React, { useState } from "react"
import { useRouter } from "next/router"
import useText from "lib/useText"
import { NextSeo } from "next-seo"
import Footer from "components/Footer"
import getConfig from "next/config"
import ProjectSelector from "components/navigation/ProjectSelector"
import { useDispatch, useSelector } from "react-redux"
import Calculator from "components/CO2Forecast/Calculator"
import InfoBox from "components/InfoBox"
import CountrySelectorStandalone from "../components/navigation/CountrySelectorStandalone"

const DEBUG = false
const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const GlobeNoSSR = dynamic( () => import( "components/geo/GlobeNoSSR" ),
	{ ssr: false } )

export default function Home() {
	const router = useRouter()
	const dispatch = useDispatch()
	const { getText } = useText()
	const country = useSelector( redux => redux.country )
	const projectIdentifier = useSelector( redux => redux.projectIdentifier )
	const [ globeCountry, set_globeCountry ] = useState( undefined )
	const [ searchCountry, set_searchCountry ] = useState( undefined )

	return (
		<div className="page">

			<NextSeo
				title={ getText( 'grff' ) }
				description={ getText( 'fossil_fuel_prod_reserves' ) }
				openGraph={ {
					url: 'https://fossilfuelregistry.org',
					title: getText( 'grff' ),
					description: getText( 'fossil_fuel_prod_reserves' ),
					images: [
						{
							url: 'https://fossilfuelregistry.org/og1.jpg',
							width: 1200,
							height: 671,
							alt: getText( 'grff' ),
						}
					],
					site_name: getText( 'grff' ),
				} }
			/>

			<TopNavigation/>

			<div className="page-padding">

				<Row gutter={ 12 }>
					<Col xs={ 24 } lg={ 8 }>
						<Row>
							<Col xs={ 24 }>
								<div className="front-card">
									<div className="header">{ getText( 'quick-search' ) }</div>
									<div className="box vspace">
										<CountrySelectorStandalone
											onChange={ c => set_searchCountry( c?.value ) }
											placeholder={ getText( 'origin_country' ) + '...' }
										/>
										<ProjectSelector
											iso3166={ searchCountry }
											iso31662={ '' }
										/>
										<Button
											type="primary" block
											disabled={ !searchCountry }
											onClick={ () => {
												let url = '/co2-forecast/' + searchCountry
												if( projectIdentifier ) url += '?project=' + encodeURIComponent( projectIdentifier )
												router.push( url )
											} }
										>
											{ getText( 'co2_forecast' ) }
										</Button>
									</div>
								</div>
							</Col>
							<Col xs={ 24 }>
								<div className="front-card">
									<div className="header">{ getText( 'co2e-calculator' ) }</div>
									<div className="box">
										<Calculator/>
									</div>
								</div>
							</Col>
							<Col xs={ 24 }>
								<div className="front-card">
									<div className="header">{ getText( 'global-results' ) }</div>
									<div className="box">
										GRAPHS
									</div>
								</div>
							</Col>
						</Row>
					</Col>

					<Col xs={ 24 } lg={ 16 }>
						<div className="globe-col-wrap">
							<div className="globe-wrap">
								<GlobeNoSSR
									onCountryClick={ set_globeCountry }
								/>
							</div>
							<Row gutter={ 12 }>
								<Col xs={ 24 } lg={ 12 }>
									<InfoBox header={ 'About' } content={ 'Hello...' }/>
								</Col>
								<Col xs={ 24 } lg={ 12 }>
									<InfoBox header={ 'Methodology' } content={ 'Hello...' }/>
								</Col>
							</Row>
						</div>
					</Col>
				</Row>
			</div>

			<Footer/>

			{ !!globeCountry &&
			<Modal
				visible={ globeCountry?.iso3166?.length > 0 }
				onCancel={ () => set_globeCountry( undefined ) }
				footer={ null }
			>
				<h1>{ globeCountry?.[ router.locale ] }</h1>

				<table>
					<tbody>
						<tr style={ { height: '50px', verticalAlign: 'bottom' } }>
							<td colSpan={ 3 }>{ globeCountry.y } { getText( 'production' ) }</td>
						</tr>

						{ globeCountry.p.map( p => (
							<tr key={ p.f }>
								<td>{ getText( p.f ) }</td>
								<td align="right">{ p.v?.toFixed( 1 ) }</td>
								<td>&nbsp;&nbsp;{ p.u }</td>
							</tr> ) ) }

						<tr style={ { height: '50px', verticalAlign: 'bottom' } }>
							<td>{ getText( 'emissions' ) }</td>
							<td align="right">{ globeCountry.t?.toFixed( 1 ) }</td>
							<td>&nbsp;&nbsp;M Tons CO²</td>
						</tr>
					</tbody>
				</table>

				<Button
					type="primary"
					block style={ { marginTop: 24 } }
					onClick={ () => {
						set_globeCountry( undefined )
						dispatch( { type: 'COUNTRY', payload: globeCountry.iso3166 } )
						router.push( 'co2-forecast/' + globeCountry.iso3166?.toLowerCase() )
					} }
				>
					{ getText( 'goto_co2_forecast' ) }
				</Button>

			</Modal> }

			<style jsx>{ `
              .aspect-order {
                display: flex;
                flex-direction: column;
              }

              @media (max-aspect-ratio: 1/1) {
                .aspect-controlled {
                  order: 3;
                }
              }

              .front-card .header {
                font-size: 16px;
                font-weight: bold;
                color: dimgrey;
              }

              .front-card .box {
                min-height: 220px;
                border: 1px solid ${ theme[ '@border-color-base' ] };
                border-radius: ${ theme[ '@border-radius-base' ] };
                padding: 10px;
                margin-bottom: 12px;
              }

              .globe-col-wrap {
                display: flex;
                flex-direction: column;
                height: 100%;
              }

              .globe-wrap {
                flex: 1 1 auto;
                min-height: 330px;
              }

              .vspace > :global(div) {
                margin-bottom: 12px;
              }
			` }
			</style>

		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
