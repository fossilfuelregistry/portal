import TopNavigation from "components/navigation/TopNavigation"
import dynamic from "next/dynamic"
import { Button, Col, Modal, Row } from "antd"
import React, { useState } from "react"
import { useRouter } from "next/router"
import useText from "lib/useText"
import { NextSeo } from "next-seo"
import Footer from "components/Footer"
import getConfig from "next/config"
import CountrySelector from "../components/navigation/CountrySelector"
import ProjectSelector from "../components/navigation/ProjectSelector"
import { useSelector } from "react-redux"
import Calculator from "../components/CO2Forecast/Calculator"

const DEBUG = false
const theme = getConfig()?.publicRuntimeConfig?.themeVariables

const GlobeNoSSR = dynamic( () => import( "components/geo/GlobeNoSSR" ),
	{ ssr: false } )

export default function Home() {
	const router = useRouter()
	const { getText } = useText()
	const country = useSelector( redux => redux.country )
	const [ globeCountry, set_globeCountry ] = useState( undefined )

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

				<Row>
					<Col xs={ 24 } lg={ 8 }>
						<Row>
							<Col xs={ 24 }>
								<div className="front-card">
									<div className="header">{ getText( 'quick-search' ) }</div>
									<div className="box vspace">
										<CountrySelector/>
										<ProjectSelector
											iso3166={ country }
											iso31662={ '' }
										/>
										<Button type="primary" block>
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
						<GlobeNoSSR
							onCountryClick={ set_globeCountry }
						/>
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

              .vspace > :global(div) {
                margin-bottom: 12px;
              }
			` }
			</style>

		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'

// 						<GlobeNoSSR
// 							onCountryClick={ set_globeCountry }
// 						/>