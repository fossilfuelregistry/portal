import useText from "lib/useText"
import { useEffect, useState } from "react"
import { notification } from "antd"
import settings from "../settings"

const DEBUG = true

export default function OpenCorporateCard( { reference } ) {
	const { getText } = useText()

	const [ company, set_company ] = useState()

	useEffect( () => {
		if( !( reference?.length > 0 ) ) return
		const asyncEffect = async() => {
			try {
				const f = await fetch( settings.openCorporate.endpoint + reference, {
					headers: { 'Accept-Encoding': 'application/json' }
				} )

				if( !f.ok ) throw new Error( 'Status ' + f.status + ' ' + f.statusText )
				const data = await f.json()
				set_company( data?.results?.company )

			} catch( e ) {
				notification.error( {
					message: "Failed to fetch OpenCorporate info",
					description: e.message
				} )
			}
		}
		asyncEffect()
	}, [ reference ] )
	return (
		<>
			{ company &&
			<div className="oc-ard">
				<h2>{ getText( 'operating_corporate_entity' ) }</h2>
				<div><b><a href={settings.openCorporate.web + reference}>{ company.name }</a></b></div>
				<div>{ company.registered_address_in_full }</div>
				<div>{ getText( 'operating_corporate_entity_incorporation_date' ) }: { company.incorporation_date }</div>
				<div>{ getText( 'operating_corporate_entity_type' ) }: { company.company_type }</div>
			</div>
			}
		</>
	)
}
