import TopNavigation from "components/navigation/TopNavigation"
import dynamic from "next/dynamic"
import { Button, Modal } from "antd"
import React, { useState } from "react"
import { useRouter } from "next/router"
import useText from "lib/useText"
import { NextSeo } from "next-seo"
import Footer from "components/Footer"

const DEBUG = false

const GlobeNoSSR = dynamic( () => import( "components/geo/GlobeNoSSR" ),
	{ ssr: false } )

export default function Home() {
	const router = useRouter()
	const { getText } = useText()
	const [ country, set_country ] = useState( undefined )

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

			<div className="aspect-order">
				<div className="content-block">
					<GlobeNoSSR
						onCountryClick={ set_country }
					/>
				</div>
			</div>

			<Footer/>

			{ !!country &&
			<Modal
				visible={ country?.iso3166?.length > 0 }
				onCancel={ () => set_country( undefined ) }
				footer={ null }
			>
				<h1>{ country?.[ router.locale ] }</h1>

				<table>
					<tbody>
						<tr style={{ height: '50px', verticalAlign: 'bottom' }}>
							<td colSpan={ 3 }>{ country.y } { getText( 'production' ) }</td>
						</tr>

						{ country.p.map( p => (
							<tr key={ p.f }>
								<td>{ getText( p.f ) }</td>
								<td align="right">{ p.v?.toFixed( 1 ) }</td>
								<td>&nbsp;&nbsp;{ p.u }</td>
							</tr> ) ) }

						<tr style={{ height: '50px', verticalAlign: 'bottom' }}>
							<td>{ getText( 'emissions' ) }</td>
							<td align="right">{ country.t?.toFixed( 1 ) }</td>
							<td>&nbsp;&nbsp;M Tons CO²</td>
						</tr>
					</tbody>
				</table>

				<Button
					type="primary"
					block style={ { marginTop: 24 } }
					onClick={ () => {
						set_country( undefined )
						router.push( 'co2-forecast/' + country.iso3166?.toLowerCase() )
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

			` }
			</style>

		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
