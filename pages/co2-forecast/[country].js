import React, { useEffect } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import CountrySelector from "components/navigation/CountrySelector"
import { Col, Row } from "antd"
import useText from "lib/useText"
import { NextSeo } from "next-seo"
import { useSelector , useDispatch } from "react-redux"
import CarbonIntensitySelector from "components/viz/IntensitySelector"
import HelpModal from "components/HelpModal"
import LoadData from "components/CO2Forecast/LoadData"
import ProjectSelector from "components/navigation/ProjectSelector"
import { useQuery } from "@apollo/client"
import { GQL_productionSources, GQL_projectionSources, GQL_reservesSources } from "queries/general"
import SourceSelector from "components/navigation/SourceSelector"
import { getProducingCountries } from "lib/getStaticProps"
import { getPreferredReserveGrade } from "components/CO2Forecast/calculate"
import { useRouter } from "next/router"
import SparseProject from "components/CO2Forecast/SparseProject"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function CO2ForecastPage() {
	const { getText } = useText()
	const country = useSelector( redux => redux.country )
	const countryName = useSelector( redux => redux.countryName )
	const region = useSelector( redux => redux.region )
	const project = useSelector( redux => redux.project )
	const router = useRouter()
	const dispatch = useDispatch()

	const { data: _productionSources, loading: productionLoading } = useQuery( GQL_productionSources, {
		variables: { iso3166: country, iso31662: region, projectId: project?.projectId },
		skip: !country
	} )

	const { data: _projectionSources, loading: projectionLoading } = useQuery( GQL_projectionSources, {
		variables: { iso3166: country, iso31662: region, projectId: project?.projectId },
		skip: !country
	} )

	const { data: _reservesSources, loading: reservesLoading } = useQuery( GQL_reservesSources, {
		variables: { iso3166: country, iso31662: region, projectId: project?.projectId },
		skip: !country
	} )

	const title = ( countryName ? countryName + ' - ' : '' ) + getText( 'co2_effects_for_country' )

	const productionSources = ( _productionSources?.getProductionSources?.nodes ?? [] )
	const projectionSources = ( _projectionSources?.getProjectionSources?.nodes ?? [] )
	const reservesSources = ( _reservesSources?.getReservesSources?.nodes ?? [] )
		.map( s => ( {
			...s,
			namePretty: `${ getPreferredReserveGrade( s.grades ) } ${ s.year }`
		} ) )

	useEffect( () => {
		if( !reservesSources?.length > 0 ) return
		//dispatch()
	}, [ reservesSources?.[ 0 ] ] )

	useEffect( () => {
		const qCountry = router.query?.country
		if( qCountry === null || qCountry === '-' || qCountry === 'null' ) return
		DEBUG && console.log( 'useEffect PRELOAD country', { country, qCountry } )
		if( qCountry !== country ) dispatch( { type: 'COUNTRY', payload: qCountry } )
	}, [ router.query?.country ] )
	
	return (
		<>
			<NextSeo
				title={ title }
				description={ getText( 'a_service_from_gffr' ) }
				openGraph={ {
					url: 'https://fossilfuelregistry.org',
					title: getText( 'grff' ),
					description: title,
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

			<div className="page">
				<TopNavigation share={ true }/>

				<div className="co2">

					<Row gutter={ [ 12, 12 ] } style={ { marginBottom: 26 } }>

						<Col xs={ 12 } lg={ 6 }>
							<h3>{ getText( 'country' ) }</h3>
							<CountrySelector/>
							<ProjectSelector
								iso3166={ country }
								iso31662={ region ?? '' }
							/>
						</Col>

						<Col xs={ 12 } lg={ 4 }>
							<h3>
								{ getText( 'data_source' ) }
								<HelpModal title="data_source" content="explanation_countryhistoric"/>
							</h3>
							<SourceSelector
								sources={ productionSources }
								loading={ productionLoading }
								stateKey="productionSourceId"
								placeholder={ getText( 'data_source' ) }
							/>
						</Col>

						<Col xs={ 12 } lg={ 5 }>
							<h3>{ getText( 'reserves' ) }</h3>
							<SourceSelector
								sources={ reservesSources }
								loading={ reservesLoading }
								stateKey="reservesSourceId"
								placeholder={ getText( 'reserves' ) }
							/>
						</Col>

						<Col xs={ 12 } lg={ 5 }>
							<div>
								<h3>
									{ getText( 'projection' ) }
								</h3>
								<SourceSelector
									sources={ projectionSources }
									loading={ projectionLoading }
									stateKey="projectionSourceId"
									placeholder={ getText( 'projection' ) }
								/>
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

					{project?.dataType !== 'sparse' && <LoadData/> }

					{project?.dataType === 'sparse' && <SparseProject/> }

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

export async function getStaticPaths() {
	const countries = await getProducingCountries()
	countries.push( { iso3166: '-' } )
	return {
		paths: countries.flatMap( c => [
			{ params: { country: c.iso3166 } },
			{ params: { country: c.iso3166 }, locale: 'fr' },
			{ params: { country: c.iso3166 }, locale: 'es' },
		] ),
		fallback: false
	}
}
