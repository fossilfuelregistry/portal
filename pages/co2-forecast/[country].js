import React, { useEffect, useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import getConfig from 'next/config'
import CountrySelector from "components/navigation/CountrySelector"
import { Alert, Col, Divider, Row } from "antd"
import useText from "lib/useText"
import { NextSeo } from "next-seo"
import { useDispatch, useSelector } from "react-redux"
import CarbonIntensitySelector from "components/viz/IntensitySelector"
import HelpModal from "components/HelpModal"
import LoadCountryData from "components/CO2Forecast/LoadCountryData"
import { useQuery } from "@apollo/client"
import { GQL_projectSources } from "queries/general"
import SourceSelector from "components/navigation/SourceSelector"
import { getProducingCountries } from "lib/getStaticProps"
import { getPreferredReserveGrade } from "components/CO2Forecast/calculate"
import { useRouter } from "next/router"
import SparseProject from "components/CO2Forecast/SparseProject"
import LeafletNoSSR from "components/geo/LeafletNoSSR"
import { GQL_countryBorder, GQL_countrySources } from "queries/country"
import CountryProductionPieChart from "components/CO2Forecast/CountryProductionPieChart"
import { useConversionHooks } from "components/viz/conversionHooks"
import LargestProjects from "components/CO2Forecast/LargestProjects"
import Sources from "components/CO2Forecast/Sources"
import DenseProject from "components/CO2Forecast/DenseProject"
import Footer from "components/Footer"
import ProjectSelector from "components/navigation/ProjectSelector"
import MapLibre from "../../components/geo/MapLibre"

const DEBUG = false

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function CO2ForecastPage() {
	const { getText } = useText()
	const { getCountryCurrentCO2, pageQuery } = useConversionHooks()
	const country = useSelector( redux => redux.country )
	const countryName = useSelector( redux => redux.countryName )
	const region = useSelector( redux => redux.region )
	const gwp = useSelector( redux => redux.gwp )
	const productionSourceId = useSelector( redux => redux.productionSourceId )
	const project = useSelector( redux => redux.project )
	const [ countryCurrentProduction, set_countryCurrentProduction ] = useState( 0 )
	const [ highlightedProjects, set_highlightedProjects ] = useState( [] )
	const router = useRouter()
	const dispatch = useDispatch()

	const query = pageQuery()

	const { data: _countrySources, loading: cLoad } = useQuery( GQL_countrySources, {
		variables: { iso3166: country, iso31662: region },
		skip: !country
	} )

	const { data: _projectSources, loading: pLoad } = useQuery( GQL_projectSources, {
		variables: { id: project?.id },
		skip: !( project?.id > 0 )
	} )

	const { data: _border } = useQuery( GQL_countryBorder, {
		variables: { isoA2: country?.toUpperCase(), iso3166: country },
		skip: !country
	} )

	const loading = cLoad || pLoad

	const title = ( countryName ? countryName + ' - ' : '' ) + getText( 'co2_effects_for_country' )

	let productionSources, projectionSources, reservesSources

	DEBUG && console.log( 'COUNTRY', { project, nextQuery: router.query, myQuery: query } )

	if( project?.id > 0 ) {
		productionSources = ( _projectSources?.getProjectSources?.nodes ?? [] )
			.filter( s => s.dataType === 'PRODUCTION' )
		projectionSources = ( _projectSources?.getProjectSources?.nodes ?? [] )
			.filter( s => s.dataType === 'PROJECTION' )
		reservesSources = ( _projectSources?.getProjectSources?.nodes ?? [] )
			.filter( s => s.dataType === 'RESERVE' )
			.map( s => ( {
				...s,
				namePretty: `${ getPreferredReserveGrade( s.grades ) } ${ s.year }`
			} ) )
		DEBUG && console.log( { _projectSources, productionSources, projectionSources, reservesSources } )
	} else {
		productionSources = ( _countrySources?.getCountrySources?.nodes ?? [] )
			.filter( s => s.dataType === 'PRODUCTION' )
			.sort( ( a, b ) => Math.sign( ( b.quality ?? 0 ) - ( a.quality ?? 0 ) ) )

		const distinctSourceIds = {} // On source can appear several times if it has different quality for different data points.
		projectionSources = ( _countrySources?.getCountrySources?.nodes ?? [] )
			.filter( s => {
				if( !( s.dataType === 'PROJECTION' ) ) return false
				if( distinctSourceIds[ s.sourceId ] !== undefined ) return false
				distinctSourceIds[ s.sourceId ] = Math.max( s.quality, distinctSourceIds[ s.sourceId ] )
				return true
			} )
			.map( s => ( { ...s, quality: distinctSourceIds[ s.sourceId ] } ) ) // Use max value found
			.sort( ( a, b ) => Math.sign( ( b.quality ?? 0 ) - ( a.quality ?? 0 ) ) )

		reservesSources = ( _countrySources?.getCountrySources?.nodes ?? [] )
			.filter( s => s.dataType === 'RESERVE' )
			.map( s => ( {
				...s,
				namePretty: `${ getPreferredReserveGrade( s.grades ) } ${ s.year }`
			} ) )
			.sort( ( a, b ) => Math.sign( ( b.quality ?? 0 ) - ( a.quality ?? 0 ) ) )
		DEBUG && console.log( {
			productionSources,
			projectionSources,
			reservesSources
		} )
	}

	const borders = _border?.neCountries?.nodes?.[ 0 ]?.geometry?.geojson
	const projectBorders = _border?.projects?.nodes ?? []

	useEffect( () => {
		const asyncEffect = async() => {
			const ct = await getCountryCurrentCO2( country )
			set_countryCurrentProduction( ct )
		}
		asyncEffect()
	}, [ country, gwp ] )

	useEffect( () => {
		const qCountry = router.query?.country
		if( qCountry === null || qCountry === '-' || qCountry === 'null' ) return
		DEBUG && console.log( 'useEffect PRELOAD country', { country, qCountry } )
		if( qCountry !== country ) dispatch( { type: 'COUNTRY', payload: qCountry } )
	}, [ router.query?.country ] )

	let templateId = 'intro', template, proj = router.query.project
	if( country && ( !project || !( proj?.length > 0 ) ) )
		templateId = 'dense-country'
	if( proj?.length > 0 && project?.projectType === 'DENSE' )
		templateId = "dense-project"
	if( proj?.length > 0 && project?.projectType === 'SPARSE' )
		templateId = 'sparse-project'

	DEBUG && console.log( 'Template select:', { templateId, project, productionSourceId } )

	switch( templateId ) {

		case 'intro':
			template = (
				<div className="text-page">
					<h2>Country emissions history and forcast</h2>
					<p>Intro text about country / project levels, ranges etc goes here...</p>
					<p>First select a country!</p>
					<ProjectSelector
						iso3166={ country }
						iso31662={ region ?? '' }
					/>
				</div>
			)
			break
		case "dense-country":
			template = (
				<>
					<Divider><h4>{ getText( 'country_overview' ) }</h4></Divider>

					<Row gutter={ [ 32, 32 ] } style={ { marginBottom: 26 } }>
						<Col xs={ 24 } lg={ 12 } xxl={ 8 }>
							<CountryProductionPieChart
								currentProduction={ countryCurrentProduction }
							/>
						</Col>

						<Col xs={ 24 } lg={ 12 } xxl={ 8 }>
							<div className="geo-wrap">
								<MapLibre
									className="country-geo"
									outlineGeometry={ borders }
									highlightedProjects={ highlightedProjects }
									projects={ projectBorders }
								/>
							</div>
						</Col>

						<Col xs={ 24 } lg={ 12 } xxl={ 8 }>
							<LargestProjects
								onGeoClick={ geo => {
									set_highlightedProjects( [ geo ] )
									console.log( geo )
								} }
							/>
						</Col>
					</Row>

					<Divider style={ { marginTop: 48 } }><h4>{ getText( 'co2_forecast' ) }</h4></Divider>

					{ productionSourceId > 0 && <LoadCountryData projectionSources={ projectionSources }/> }

					<div/>
					<Divider style={ { marginTop: 48 } }/>

					<Sources
						production={ productionSources }
						reserves={ reservesSources }
						projection={ projectionSources }
					/>
				</> )
			break

		case "dense-project":
			template =
				<DenseProject
					countryCurrentProduction={ countryCurrentProduction }
					borders={ borders }
					productionSources={ productionSources }
					projectionSources={ projectionSources }
					reservesSources={ reservesSources }
				/>
			break

		case "sparse-project":
			template =
				<SparseProject
					countryCurrentProduction={ countryCurrentProduction }
					borders={ borders }
				/>
			break

		default:
			template = <Alert showIcon type="warning" message={ 'No template for ' + templateId }/>
	}
	//debugger
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

						<Col xs={ 24 } lg={ 6 }>
							<h4>{ getText( 'country' ) }</h4>
							<CountrySelector/>

							<h4 className="selector">
								{ getText( 'carbon_intensity' ) }
								<HelpModal title="carbon_intensity" content="explanation_methanefactor"/>
							</h4>
							<CarbonIntensitySelector/>

							{ project?.type !== 'SPARSE' &&
							<>
								<h4 className="selector">
									{ getText( 'data_source' ) }
									<HelpModal title="data_source" content="explanation_countryhistoric"/>
								</h4>
								<SourceSelector
									sources={ productionSources }
									loading={ loading }
									stateKey="productionSourceId"
									placeholder={ getText( 'data_source' ) }
								/>
							</>
							}

							{ !!productionSourceId && project?.type !== 'SPARSE' &&
							<>
								<h4 className="selector">{ getText( 'reserves' ) }</h4>
								<SourceSelector
									sources={ reservesSources }
									loading={ loading }
									stateKey="reservesSourceId"
									placeholder={ getText( 'reserves' ) }
								/>

								<h4 className="selector">
									{ getText( 'projection' ) }
								</h4>
								<SourceSelector
									sources={ projectionSources }
									loading={ loading }
									stateKey="projectionSourceId"
									placeholder={ getText( 'projection' ) }
								/>
							</> }

						</Col>

						<Col xs={ 24 } lg={ 18 }>
							{ template }
						</Col>
					</Row>

				</div>

				<Footer/>

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

                  h4 {
                    margin-bottom: 6px !important;
                  }

                  .selector {
                    margin-top: 12px !important;
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

                  .page :global(.geo-wrap) {
                    margin-top: 24px;
                    position: relative;
                  }

                  .page :global(.country-geo) {
                    width: 100%;
                    height: 400px;
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
