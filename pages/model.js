import React, { useEffect, useRef, useState } from "react"
import TopNavigation from "components/navigation/TopNavigation"
import Footer from "components/Footer"
import { useApolloClient, useQuery } from "@apollo/client"
import { GQL_productionCountries } from "queries/general"
import GraphQLStatus from "components/GraphQLStatus"
import InfiniteLoader from 'react-window-infinite-loader'
import Loading from "components/Loading"
import { GQL_countryProduction } from "../queries/country"
import { useConversionHooks } from "../components/viz/conversionHooks"
import CarbonIntensitySelector from "components/viz/IntensitySelector"
import { Col, Row } from "antd"
import { useSelector } from "react-redux"
import { prepareProductionDataset } from "../components/CO2Forecast/calculate"
import { useRouter } from "next/router"
import { VariableSizeList } from "react-window"

const sources = [ 1, 2, 3 ]

function Wrapper( {
	// Are there more items to load?
	// (This information comes from the most recent API request.)
	hasNextPage,

	// Are we currently loading a page of items?
	// (This may be an in-flight flag in your Redux store for example.)
	isNextPageLoading,

	// Array of items loaded so far.
	items,

	// Callback function responsible for loading the next page of items.
	loadNextPage
} ) {
	// If there are more items to be loaded then add an extra row to hold a loading indicator.
	const itemCount = hasNextPage ? items.length + 1 : items.length

	// Only load 1 page of items at a time.
	// Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
	const loadMoreItems = isNextPageLoading ? () => {
	} : loadNextPage

	// Every row is loaded except for our loading indicator row.
	const isItemLoaded = index => items[ index ]?.isItemLoaded

	const [ itemSizes, set_itemSizes ] = useState( 0 )
	const listRef = useRef()

	useEffect( () => {
		listRef.current?.resetAfterIndex( 0 )
	}, [ itemSizes ] )

	// Render an item or a loading indicator.
	const Item = ( { index, style } ) => {
		const { co2FromVolume } = useConversionHooks()
		const gwp = useSelector( redux => redux.gwp )
		const allSources = useSelector( redux => redux.allSources )

		let content
		if( !isItemLoaded( index ) ) {
			content = <Loading/>
		} else {
			const country = items[ index ]
			if( !country.production[ 0 ]?.fossilFuelType ) return null

			let totals = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }
			const tableData = []

			country.production.forEach( ( p, i ) => {
				p.co2 = co2FromVolume( p, country.iso3166 === 'dk' )
				p.country = country.iso3166
				p.label =
					<span>{ allSources.find( s => s.sourceId === p.sourceId )?.name } { p.fossilFuelType } { p.subtype }</span>

				tableData.push( p )

				for( let r = 0; r <= 2; r++ ) {
					totals.scope1[ r ] += p.co2.scope1?.[ r ] ?? 0
					totals.scope3[ r ] += p.co2.scope3?.[ r ] ?? 0
				}

				if( i + 1 === country.production.length || country.production[ i + 1 ].sourceId !== p.sourceId ) {
					tableData.push( {
						co2: totals,
						id: 'T' + p.id,
						label: <span>Total<br/><br/></span>,
						className: 'total'
					} )

					totals = { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] }
				}
			} )

			content = (
				<div
					style={ { paddingBottom: 20 } }
					ref={ el => {
						if( !el ) return
						if( items[ index ].divHeight === el.getBoundingClientRect().height ) return

						items[ index ].divHeight = el.getBoundingClientRect().height
						set_itemSizes( itemSizes + 1 )  // Trigger parent rerender
					} }
				>
					<div>
						{ country.en } (<b>{ country.iso3166 }</b>)
					</div>
					<table>
						<thead>
							<tr>
								<td/>
								<td className="scope" colSpan={ 3 } style={ { textAlign: 'center' } }>Scope 1</td>
								<td className="scope" colSpan={ 3 } style={ { textAlign: 'center' } }>Scope 3</td>
								<td className="scope" colSpan={ 3 } style={ { textAlign: 'center' } }>Sum</td>
							</tr>
							<tr>
								<td style={ { textAlign: 'left' } }>Source</td>
								<td className="scope">Low</td>
								<td>Mid</td>
								<td>High</td>
								<td className="scope">Low</td>
								<td>Mid</td>
								<td>High</td>
								<td className="scope">Low</td>
								<td>Mid</td>
								<td>High</td>
							</tr>
						</thead>
						<tbody>

							{ tableData.map( p => (
								<tr key={ p.id } className={ p.className }>
									<td style={ { textAlign: 'left' } }>{ p.label }</td>
									<td>{ p.co2.scope1?.[ 0 ]?.toFixed( 1 ) }</td>
									<td>{ p.co2.scope1?.[ 1 ]?.toFixed( 1 ) }</td>
									<td>{ p.co2.scope1?.[ 2 ]?.toFixed( 1 ) }</td>
									<td>{ p.co2.scope3?.[ 0 ]?.toFixed( 1 ) }</td>
									<td>{ p.co2.scope3?.[ 1 ]?.toFixed( 1 ) }</td>
									<td>{ p.co2.scope3?.[ 2 ]?.toFixed( 1 ) }</td>
									<td>{ ( p.co2.scope1?.[ 0 ] + p.co2.scope3?.[ 0 ] )?.toFixed( 1 ) }</td>
									<td>{ ( p.co2.scope1?.[ 1 ] + p.co2.scope3?.[ 1 ] )?.toFixed( 1 ) }</td>
									<td>{ ( p.co2.scope1?.[ 2 ] + p.co2.scope3?.[ 2 ] )?.toFixed( 1 ) }</td>
								</tr>
							) ) }

						</tbody>
					</table>
					<style jsx>{ `
                      td {
                        font-size: 10px;
                        padding: 0  0 0 12px;
                      }

                      .scope {
                        padding-left: 50px;
                      }

                      .total {
                        border-top: 1px solid #cccccc;
                        font-weight: bold;
                        vertical-align: top;
                      }

                      tbody td {
                        text-align: right;
                      }

                      thead td {
                        text-align: right;
                        font-weight: bold;
                        color: #999999;
                        background-color: #f2f2f2;
                      }
					` }
					</style>
				</div> )
		}

		return <div style={ style }>{ content }</div>
	}

	return (
		<div style={ { padding: 24 } }>
			<InfiniteLoader
				isItemLoaded={ isItemLoaded }
				itemCount={ itemCount }
				loadMoreItems={ loadMoreItems }
				threshold={ 2 }
			>
				{ ( { onItemsRendered, ref } ) => (
					<VariableSizeList
						itemCount={ itemCount }
						onItemsRendered={ onItemsRendered }
						ref={ e => {
							ref( e )
							listRef.current = e
						} }
						height={ 800 }
						width={ 800 }
						itemSize={ index => items[ index ].divHeight }
					>
						{ Item }
					</VariableSizeList>
				) }
			</InfiniteLoader>
		</div>
	)
}

export default function Model() {
	const apolloClient = useApolloClient()
	const [ countries, set_countries ] = useState( [] )
	const router = useRouter()

	const { data: countriesData, loading: loadingCountries, error: errorLoadingCountries }
		= useQuery( GQL_productionCountries )

	useEffect( () => {
		if( !( countriesData?.getProducingIso3166?.nodes?.length > 0 ) ) return
		if( countries?.length === countriesData?.getProducingIso3166?.nodes?.length ) return
		set_countries( countriesData.getProducingIso3166.nodes.map( c => ( {
			...c,
			isItemLoaded: false,
			divHeight: 200
		} ) ) )
	}, [ countriesData?.getProducingIso3166?.nodes?.length ] )

	if( loadingCountries || errorLoadingCountries )
		return <GraphQLStatus loading={ loadingCountries } error={ errorLoadingCountries }/>

	return (
		<div className="page">
			<TopNavigation/>
			<div className="page-padding">
				<Row gutter={ 16 }>
					<Col>
						<CarbonIntensitySelector/>
					</Col>
				</Row>
			</div>

			<Wrapper
				items={ countries }
				loadNextPage={ async( startIndex, stopIndex ) => {
					for( let index = startIndex; index <= stopIndex; index++ ) {
						const country = countries[ index ]
						if( country.isItemLoaded ) continue
						const q = await apolloClient.query( {
							query: GQL_countryProduction,
							variables: { iso3166: country.iso3166, iso31662: '' }
						} )
						country.production = prepareProductionDataset( ( q.data?.countryDataPoints?.nodes ?? [] ).filter( p => p.year === parseInt( router.query.year ) ?? 2019 ) )
						if( country.iso3166 === 'dk' ) console.log( {
							prepared: country.production,
							raw: q.data?.countryDataPoints?.nodes?.filter( p => p.year === parseInt( router.query.year ) ?? 2019 )
						} )
						country.isItemLoaded = true
					}
				} }
			/>
			<Footer/>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
