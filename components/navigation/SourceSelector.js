import { Select } from "antd"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import HelpModal from "../HelpModal"
import useText from "../../lib/useText"

export default function SourceSelector( { sources, stateKey, placeholder } ) {
	const router = useRouter()
	const { getText } = useText()
	const [ selectedSourceOption, set_selectedSourceOption ] = useState()
	const dispatch = useDispatch()

	useEffect( () => {
		if( router.query[ stateKey ] )
			set_selectedSourceOption( router.query[ stateKey ] )
	}, [ router.query[ stateKey ] ] )

	return (
		<div style={ { marginTop: 12 } }>
			<Select
				showSearch
				style={ { minWidth: 120, width: '100%' } }
				value={ selectedSourceOption }
				allowClear={ true }
				placeholder={ placeholder }
				defaultActiveFirstOption={ true }
				onChange={ async value => {
					set_selectedSourceOption( value )
					dispatch( { type: stateKey.toUpperCase(), payload: parseInt( value ) } )
					const query = { ...router.query }
					delete query[ stateKey ]
					if( value ) query[ stateKey ] = value
					await router.replace( { pathname: router.pathname, query } )
				} }
			>
				{ sources.map( s => {
					let name = s.name + ' (' + s.namePretty + ')'
					if( s.name?.startsWith( 'name_' ) ) name = getText( s.name ) + ' (' + getText( s.namePretty ) + ')'

					return (
						<Select.Option key={ s.sourceId }>
							{ name }
							{ s.description?.startsWith( 'explanation_' ) &&
							<HelpModal
								title={ placeholder }
								content={ s.description }
							/>
							}
						</Select.Option> )
				} ) }
			</Select>
		</div>
	)
}
