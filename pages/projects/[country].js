import React, {  useEffect } from "react";
import TopNavigation from "components/navigation/TopNavigation";
import useText from "lib/useText";
import Footer from "components/Footer";
import { useRouter } from "next/router";
import { getProducingCountries } from "lib/getStaticProps";
import { useDispatch, useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GQL_projects } from "../../queries/general"
import { NextSeo } from "next-seo"
import { useConversionHooks } from "components/viz/conversionHooks"

import ProjectsTable from "components/projects/ProjectsTable"

const DEBUG = false

export default function Projects() {
	const router = useRouter();
	const { getText } = useText()
	const dispatch = useDispatch()
	const countryName = useSelector( redux => redux.countryName )
	const country = useSelector( redux => redux.country )
	const region = useSelector( redux => redux.region )
	const gwp = useSelector( redux => redux.gwp )
	const { getCountryCurrentCO2 } = useConversionHooks()


	const title = ( countryName ? countryName + ' - ' : '' ) + getText( 'largest_projects' )
	
	const { data, loading, error } = useQuery( GQL_projects, {
		variables: { iso3166_: country, iso31662_: region ?? '' },
		skip: !country
	} )
	
	useEffect( () => {
		const asyncEffect = async() => {
			const ct = await getCountryCurrentCO2( country ) || []
			const EIA_SOURCE_ID = 2
			dispatch( { type: 'COUNTRYTOTALCO2', payload: ct.find( c=>c.sourceId === EIA_SOURCE_ID )?.totalCO2 ?? null } )
		}
		asyncEffect()
	}, [ country, gwp ] )

	useEffect( () => {
		const qCountry = router.query?.country
		if( qCountry === null || qCountry === '-' || qCountry === 'null' ) return
		DEBUG && console.info( 'useEffect PRELOAD country', { country, qCountry } )
		if( qCountry !== country ) dispatch( { type: 'COUNTRY', payload: qCountry } )
	}, [ router.query?.country ] )

	if( loading || error || !data ) return null

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
					{ country && <ProjectsTable /> }
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
