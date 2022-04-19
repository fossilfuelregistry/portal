import React, { useState, useEffect, useMemo } from "react";
import TopNavigation from "components/navigation/TopNavigation";
import useText from "lib/useText";
import Footer from "components/Footer";
import { useRouter } from "next/router";
import { getProducingCountries } from "lib/getStaticProps";
import { Table, Row, Col, Checkbox, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GQL_projects } from "../../queries/general"
import useNumberFormatter from "lib/useNumberFormatter"
import FuelIcon from "components/navigation/FuelIcon"
import settings from "../../settings"
import CsvDownloader from "react-csv-downloader"
import { DownloadOutlined } from "@ant-design/icons"
import HelpModal from "components/HelpModal"
import { NextSeo } from "next-seo"
import frFR from 'antd/lib/locale/fr_FR'
import esES from 'antd/lib/locale/es_ES'
import enUS from 'antd/lib/locale/en_US'

const DEBUG = true

export default function Projects() {
	const router = useRouter();
	const { getText } = useText()
	const dispatch = useDispatch()
	const countryName = useSelector( redux => redux.countryName )
	const country = useSelector( redux => redux.country )
	const region = useSelector( redux => redux.region )
	const language = useSelector( redux => redux.language )
	const countryTotalCO2 = useSelector( redux => redux.countryTotalCO2 )
	const [ filters, set_filters ] = useState( { oil: true, gas: true, coal: true } )
	const numberFormatter = useNumberFormatter()
	const [ filteredTableData, setFilteredTableData ] = useState( [] )
	const [ locale, setLocale ] = useState( enUS )

	const locales = new Map()
	locales.set( "es", esES )
	locales.set( "fr", frFR )
	locales.set( "en", enUS )

	useEffect( ()=>setLocale( locales.get( language ) ),[ language ] )

	const title = ( countryName ? countryName + ' - ' : '' ) + getText( 'largest_projects' )


	const { data, loading, error } = useQuery( GQL_projects, {
		variables: { iso3166_: country, iso31662_: region ?? '' },
		skip: !country
	} )

	useEffect( () => {
		const qCountry = router.query?.country
		if( qCountry === null || qCountry === '-' || qCountry === 'null' ) return
		DEBUG && console.info( 'useEffect PRELOAD country', { country, qCountry } )
		if( qCountry !== country ) dispatch( { type: 'COUNTRY', payload: qCountry } )
	}, [ router.query?.country ] )

	const projects = useMemo( () => ( data?.getProjects?.nodes ?? [] )
		.filter( p => p.co2 > 0 )
		.sort( ( a, b ) => Math.sign( b.co2 - a.co2 ) )
	, [ data?.getProjects?.nodes?.length ] )


	const tableData = useMemo( ()=> projects.map( p => ( {
		fuels: p.fuels,
		co2: p.co2,
		co2Formatted: numberFormatter( p.co2 / 1e6 ),
		co2Percentage: undefined, //( p.co2 / ( countryTotalCO2 * 1e7 ) ).toFixed( 0 ),
		projectIdentifier: p.projectIdentifier
	} ) ),[ projects ] )

	

	DEBUG && console.info( projects )

	useEffect( ( ) => {
		const filteredData = tableData.filter( d => {
			if( filters.oil && d.fuels.includes( 'oil' ) ) return true
			if( filters.gas && d.fuels.includes( 'gas' ) ) return true
			if( filters.coal && d.fuels.includes( 'coal' ) ) return true
			return false
		} )
		setFilteredTableData( filteredData )
	},[ tableData, filters ] )

	useEffect( () => {
		if( !( projects?.length > 0 ) ) return
		//onPositions?.( projects.map( p => p.geoPosition ) )
	}, [ projects ] )

	const downloadableData = useMemo( ()=> {
		return filteredTableData.map( p=>( {
			fuels: p.fuels.join( ', ' ),
			co2: p.co2Formatted ,
			project: p.projectIdentifier
		} ) )
	},[ filteredTableData ] )


	if( loading || error || !data ) return null
	if( !projects.length ) return null

	const largest = projects
		.filter( p => {
			let show = false
			p.fuels?.forEach( f => {
				if( filters[ f ] ) show = true
			} )
			return show
		} )
		.slice( 0, 9 )



	const columns = [
		{
			title: getText( 'fossil_fuel_type' ),
			dataIndex: "fuels",
			/*filters: settings.supportedFuels.map( fuel => ( {
				text: getText( fuel ),
				value: fuel,
			} ) ),
			filteredValues: filters || null,
			onFilter: ( value, record ) => {
				console.log( { filters }, { value } )
				record.fuels.includes( value )

			},*/
			render: ( fuels ) => fuels?.map( ( fuel, i ) => <FuelIcon fuel={ fuel } height={ 22 } key={i.toString()} /> )
		},
		{
			title: getText( 'project' ),
			dataIndex: "projectIdentifier",
			sorter: ( a, b ) =>  a.projectIdentifier.localeCompare( b.projectIdentifier )
		},
		{
			title: 'co2',
			dataIndex: "co2Formatted",
			sorter: ( a, b ) =>  a.co2 - b.co2
		},
		/*{
			title: 'co2 %',
			dataIndex: "co2Percentage",
			sorter: ( a, b ) =>  a.co2 - b.co2
		},*/
	];

	const onChange = ( pagination, filters, sorter, extra ) => {}


	
	
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
			<div className="static-page">
				<TopNavigation />

				<div className="page-padding">

					<Row justify="center" gutter={ 16 }>
						{ settings.supportedFuels.map( fuel =>
							<Col key={ fuel }>
								<Checkbox
									checked={ filters[ fuel ] !== false }
									onChange={ e => {
										console.log( e )
										set_filters( { ...filters, [ fuel ]: e.target.checked } )
									} }
								>
									<div style={ { display: 'inline-flex', opacity: ( filters[ fuel ] !== false ) ? 1 : 0.4 } }>
										<FuelIcon fuel={ fuel } height={ 22 }/>
										<div style={ { paddingLeft: 4 } }>{ getText( fuel ) }</div>
									</div>
								</Checkbox>
							</Col>

						) }

						<Col>
							<CsvDownloader
								datas={ downloadableData }
								filename={ country + '_projects.csv' }
							>
								<DownloadOutlined/>
							</CsvDownloader>
						</Col>

						<Col>
							<HelpModal title="now_heading" content="now_heading_explanation"/>
						</Col>
					</Row>
					<Divider style={ { marginTop: 12 } }/>
					
					<Table columns={columns} dataSource={filteredTableData} onChange={onChange} locale={locale}  />
				</div>

				<Footer />
			</div>
		</>
	);
}

export { getStaticProps } from "lib/getStaticProps";

export async function getStaticPaths() {
	const countries = await getProducingCountries();
	countries.push( { iso3166: "-" } );
	return {
		paths: countries.flatMap( ( c ) => [
			{ params: { country: c.iso3166 } },
			{ params: { country: c.iso3166 }, locale: "fr" },
			{ params: { country: c.iso3166 }, locale: "es" },
		] ),
		fallback: false,
	};
}
