import useText from "lib/useText"
import { useEffect, useState } from "react"
import { notification } from "antd"
import settings from "../settings"
import { ExportOutlined } from "@ant-design/icons"
import getConfig from "next/config"

const DEBUG = true

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function OpenCorporateCard( { reference } ) {
	const { getText } = useText()

	const [ company, set_company ] = useState()

	useEffect( () => {
		if( !( reference?.length > 0 ) ) return
		const asyncEffect = async() => {
			try {
				const f = await fetch( settings.openCorporate.endpoint + reference + '?api_token=' + process.env.NEXT_PUBLIC_OPENCORPORATES_API_TOKEN, {
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

	if( !company ) return null

	return (
		<div className="co2-card">
			<div className="header">{ getText( 'operating_corporate_entity' ) }</div>
			<div className="box">
				<div>
					<b>{ company.name }</b> <a href={ settings.openCorporate.web + reference }><ExportOutlined/></a>
				</div>
				<div>{ company.registered_address_in_full }</div>
				<div>{ getText( 'operating_corporate_entity_incorporation_date' ) }: { company.incorporation_date }</div>
				<div>{ getText( 'operating_corporate_entity_type' ) }: { company.company_type }</div>
			</div>
		</div>
	)
}
