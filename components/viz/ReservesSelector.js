import { Select } from "antd"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import useText from "lib/useText"

export default function CarbonIntensitySelector() {
	const allSources = useSelector( redux => redux.allSources )
	const reservesSourceId = useSelector( redux => redux.reservesSourceId )
	const availableReserveSources = useSelector( redux => redux.availableReserveSources )
	const [ options, set_options ] = useState( [] )
	const dispatch = useDispatch()
	const { getText } = useText()

	useEffect( () => {
		if( !allSources?.length ) return
		const _options = availableReserveSources.map( src => {
			const source = allSources.find( s => s.sourceId === src.sourceId )
			return {
				...src,
				label: `${ source?.name } ${ src.pGrade }/${ src.cGrade } (${ src.lastYear })`
			}
		} )

		set_options( _options )
		dispatch( { type: 'RESERVESSOURCEID', payload: _options[ 0 ]?.sourceId } )

	}, [ availableReserveSources, allSources ] )

	return (
		<div className="reserves-selector">
			<Select
				style={ { minWidth: 120, width: '100%' } }
				value={ { value: reservesSourceId?.toString() } }
				labelInValue={ true }
				placeholder={ getText( 'reserves' ) }
				onChange={ v => {
					dispatch( { type: 'RESERVESSOURCEID', payload: parseInt( v.value ) } )
				} }
			>
				{ options.map( ( src, i ) => (
					<Select.Option key={ src.sourceId }>
						<span style={ ( i === 0 ? { fontWeight: 'bold' } : {} ) }>{ src.label }</span>
					</Select.Option> ) ) }
			</Select>

			<style jsx>{ `
			` }
			</style>
		</div>
	)
}
