import React, { useState, useEffect, useMemo } from "react";
import useText from "lib/useText";
import { Table, Row, Col, Checkbox, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GQL_projectsTableData } from "../../queries/general"
import useNumberFormatter from "lib/useNumberFormatter"
import FuelIcon from "components/navigation/FuelIcon"
import settings from "../../settings"
import CsvDownloader from "react-csv-downloader"
import { DownloadOutlined } from "@ant-design/icons"
import HelpModal from "components/HelpModal"
import frFR from 'antd/lib/locale/fr_FR'
import esES from 'antd/lib/locale/es_ES'
import enUS from 'antd/lib/locale/en_US'
import { formatCsvNumber } from "lib/numberFormatter"
import { useConversionHooks } from "components/viz/conversionHooks"


const DEBUG = false
const initialPageSize = 20

const ProjectsTable = () => {
	const { getText } = useText()
	const dispatch = useDispatch()
	const country = useSelector( redux => redux.country )
	const language = useSelector( redux => redux.language )
	const countryTotalCO2 = useSelector( redux => redux.countryTotalCO2 )
	const [ filters, set_filters ] = useState( { oil: true, gas: true, coal: true } )
	const numberFormatter = useNumberFormatter()
	const [ filteredTableData, setFilteredTableData ] = useState( [] )
	const [ locale, setLocale ] = useState( enUS )
	const gwp = useSelector( redux => redux.gwp )
	const { getCountryCurrentCO2 } = useConversionHooks()
	const globalLocale = useSelector( state => state.locale )

	const [ offset, setOffset ] = useState( 0 )

	const [ pagination, setPagination ] = useState( {
		current: 1,
		pageSize: initialPageSize,
	} )

	const locales = new Map()
	locales.set( "es", esES )
	locales.set( "fr", frFR )
	locales.set( "en", enUS )
	useEffect( ()=>setLocale( locales.get( language ) ),[ language ] )
	
	const { data, loading, error } = useQuery( GQL_projectsTableData, {
		variables: { iso3166: country, offset, limit: pagination.pageSize },
		skip: !country
	} )

	const numberOfProjects = data?.projects.totalCount

	useEffect(
		() => setPagination( { ...pagination, total: numberOfProjects } ),
		[ numberOfProjects ]
	);

	const projects = useMemo( ()=> (
		data?.projects?.nodes?.map( n=>( {
			id: n.id,
			projectIdentifier: n.projectIdentifier,
			co2: n.productionCo2E,
			fuels: n.fuels,
			dataYear: n.dataYear,
			firstYear: n.firstYear,
			lastYear: n.lastYear,
			projectDataPoints: n.projectDataPoints?.nodes?.map( p=>( {
				dataYear: p.dataYear,
				fossilFuelType: p.fossilFuelType,
				volume: p.volume,
				year: p.year,
				unit: p.unit,
			} ) ) ?? []
		} ) ) ?? [] )
		.filter( p => p.co2 > 0 )
		.sort( ( a, b ) => Math.sign( b.co2 - a.co2 ) )
	,[ data ] )
	

	DEBUG && console.info( { data } )

	useEffect( () => {
		const asyncEffect = async() => {
			const ct = await getCountryCurrentCO2( country ) || []
			const EIA_SOURCE_ID = 2
			dispatch( { type: 'COUNTRYTOTALCO2', payload: ct.find( c=>c.sourceId === EIA_SOURCE_ID )?.totalCO2 ?? null } )
		}
		asyncEffect()
	}, [ country, gwp ] )
    

	const toPercentageString = ( co2 ) => countryTotalCO2 ? 
		new Intl.NumberFormat( globalLocale, { maximumSignificantDigits:2, minimumSignificantDigits:2, maximumFractionDigits:3 } )
			.format( ( ( ( co2 / 1e9 ) / countryTotalCO2 )*100 ) ) 
		: ""

	const tableData = useMemo( ()=> projects.map( p => ( {
		fuels: p.fuels,
		co2: p.co2 / 1e9,
		co2Formatted: numberFormatter( p.co2 / 1e9, 2 ),
		co2Percentage: toPercentageString( p.co2 ), 
		projectIdentifier: p.projectIdentifier,
		latest_year_production: p.projectDataPoints
			.map( d=> `${getText( d.fossilFuelType )} ${ numberFormatter( d.volume )} ${d.unit} ${p.dataYear ? `(${p.dataYear})`:''}` )
			.reduce( ( prev,curr ) => `${prev}\n${curr}`, '' ),
	} ) ),[ projects ] )

	DEBUG && console.info( { projects, tableData }  )

	useEffect( ( ) => {
		const filteredData = tableData.filter( d => {
			if( filters.oil && d.fuels.includes( 'oil' ) ) return true
			if( filters.gas && d.fuels.includes( 'gas' ) ) return true
			if( filters.coal && d.fuels.includes( 'coal' ) ) return true
			return false
		} )
		setFilteredTableData( filteredData )
	},[ tableData, filters ] )

	const downloadableData = useMemo( ()=> {
		return filteredTableData.map( p=>( {
			[ getText( 'fossil_fuel_type' ) ]: p.fuels.map( f=> getText( f ) ).join( ' ' ),
			[ getText( 'm_mt_co2e' ) ]: formatCsvNumber( p.co2 ) ,
			'CO2e %': p.co2Percentage,
			[ getText( 'latest_year_production' ) ]: p.latest_year_production.replaceAll( '\n', ' - ' ),
			[ getText( 'project' ) ]: p.projectIdentifier,
		} ) )
	},[ filteredTableData ] )

	DEBUG && console.info( { downloadableData }  )

	if( error || !data ) return null

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
		},
		{
			title: getText( 'm_mt_co2e' ),
			dataIndex: "co2Formatted",
		},
		{
			title: 'CO2e [%]',
			dataIndex: "co2Percentage",
		},
		{
			title: getText( 'latest_year_production' ),
			dataIndex: "latest_year_production",
			render: ( text ) => text?.split( '\n' ).map( ( r,i ) => <p key={i.toString()}>{r}</p> ) 
		
		},
	];

	const onChange = ( pagination, filters, sorter, extra ) => {
		setOffset( pagination.current * pagination.pageSize )
		setPagination( pagination )
	}

	return (
		<>
			<Row justify="center" gutter={16}>
				{settings.supportedFuels.map( ( fuel ) => (
					<Col key={fuel}>
						<Checkbox
							checked={filters[ fuel ] !== false}
							onChange={( e ) => {
								console.log( e );
								set_filters( { ...filters, [ fuel ]: e.target.checked } );
							}}
						>
							<div
								style={{
									display: "inline-flex",
									opacity: filters[ fuel ] !== false ? 1 : 0.4,
								}}
							>
								<FuelIcon fuel={fuel} height={22} />
								<div style={{ paddingLeft: 4 }}>{getText( fuel )}</div>
							</div>
						</Checkbox>
					</Col>
				) )}

				<Col>
					<CsvDownloader
						datas={downloadableData}
						filename={country + "_projects.csv"}
						separator=";"
					>
						<DownloadOutlined />
					</CsvDownloader>
				</Col>

				<Col>
					<HelpModal title="now_heading" content="now_heading_explanation" />
				</Col>
			</Row>
			<Divider style={{ marginTop: 12 }} />
			<Table
				columns={columns}
				loading={loading}
				dataSource={filteredTableData}
				onChange={onChange}
				locale={locale}
				pagination={pagination}
			/>
		</>
	);
}

export default ProjectsTable