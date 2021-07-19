import { Select } from "antd"
import { useRouter } from "next/router"
import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"
import HelpModal from "../HelpModal"
import useText from "../../lib/useText"
import { co2PageUpdateQuery } from "components/CO2Forecast/calculate"

const DEBUG = false

export default function SourceSelector( { sources, loading, stateKey, placeholder } ) {
	const router = useRouter()
	const { getText } = useText()
	const store = useStore()
	const [ selectedSourceOption, set_selectedSourceOption ] = useState()
	const dispatch = useDispatch()
	const stateValue = useSelector( redux => redux[ stateKey ] )
	const firstInitialize = useRef( true ) // Used to NOT clear settings before sources loaded.

	if( DEBUG && stateKey === 'productionSourceId' )
		console.log( { stateKey, sources: sources.length, stateValue, selectedSourceOption } )

	useEffect( () => { // If we have only a single option, preselect it.
		if( !( sources?.length === 1 ) ) return
		const id = sources?.[ 0 ]?.sourceId
		DEBUG && console.log( stateKey, '>>>>>>>>>> Single source:', sources )
		set_selectedSourceOption( id?.toString() )
		co2PageUpdateQuery( store, router, stateKey, id )
		dispatch( { type: stateKey.toUpperCase(), payload: parseInt( id ) } )

	}, [ sources?.length === 1 ] )

	useEffect( () => { // Clear selection if selected value is no longer available.
		if( !stateValue || loading ) return

		DEBUG && console.log( stateKey, { stateValue, selectedSourceOption, sources } )

		if( sources?.length === 0 && !loading )
			if( !firstInitialize.current ) {
				DEBUG && console.log( stateKey, '>>>>>>>>>> Source empty' )
				set_selectedSourceOption( undefined )
				co2PageUpdateQuery( store, router, stateKey, undefined )
				dispatch( { type: stateKey.toUpperCase(), payload: null } )
				return
			} else {
				firstInitialize.current = false
				return
			}

		if( !sources.find( s => s.sourceId === stateValue ) ) {
			console.log( stateKey, '>>>>>>>>>> Reset' )
			set_selectedSourceOption( undefined )
			co2PageUpdateQuery( store, router, stateKey, undefined )
			DEBUG && console.log( stateKey, '>>>>>>>>>> Reset' )
			set_selectedSourceOption( undefined )
			co2PageUpdateQuery( store, router, stateKey, undefined )
		} else {
			set_selectedSourceOption( stateValue.toString() )
		}

	}, [ sources, loading, stateValue, selectedSourceOption ] )

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
					await co2PageUpdateQuery( store, router, stateKey, value )
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
