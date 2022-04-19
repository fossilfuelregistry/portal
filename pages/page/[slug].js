import React from 'react'
import { Head } from "next/head"
import DynamicZone from "../../components/DynamicZone"

const headers = {
	Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_CMS_TOKEN
}

export default function Page( { page } ) {

	if( !page ) return null
	console.log( page )
	return (
		<div className="cms-page">

			<h1>{ page.attributes?.Title }</h1>

			<DynamicZone content={ page.attributes?.Content }/>

			<style jsx>{ `
              .cms-page {
                padding: 40px
              }
			` }</style>
		</div>
	)
}

export async function getStaticProps( context ) {
	const slug = context.params.slug

	let api = await fetch( process.env.NEXT_PUBLIC_CMS_URL + '/api/pages', { headers } )
	if( !api.ok ) throw new Error( 'Pages fetch failed: ' + api.status + ' ' + api.statusText )
	const pages = await api.json()

	const p = pages.data?.find( p => p.attributes?.slug === slug )
	if( !p ) return { notFound: true }

	api = await fetch( process.env.NEXT_PUBLIC_CMS_URL + '/api/pages/' + p.id + '?populate=*', { headers } )

	if( !api.ok ) {
		if( api.status === 404 ) return { notFound: true }
		else throw new Error( 'Pages fetch failed: ' + api.status + ' ' + api.statusText )
	}

	const response = await api.json()
	const page = response.data
	if( !page ) return { notFound: true }

	return {
		props: { page },
		revalidate: 60
	}
}

export async function getStaticPaths() {
	try {
		const api = await fetch( process.env.NEXT_PUBLIC_CMS_URL + '/api/pages', { headers } )
		if( !api.ok ) throw new Error( 'Pages fetch failed: ' + api.status + ' ' + api.statusText )
		const pages = await api.json()

		return {
			paths: pages?.data
				.filter( p => p.attributes?.slug?.length > 0 )
				.map( p => ( { params: { slug: p.attributes?.slug } } ) ) ?? [],
			fallback: 'blocking'
		}
	} catch( error ) {
		console.log( error )
	}
}
