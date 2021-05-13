import { Select } from "antd"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import useText from "lib/useText"

export default function CarbonIntensitySelector() {
	const allSources = useSelector( redux => redux.allSources )
	const reservesSourceId = useSelector( redux => redux.reservesSourceId )
	const availableReserveSources = useSelector( redux => redux.availableReserveSources )
	const [ options, set_options ] = useState( [] )
	const [ value, set_value ] = useState()
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
	}, [ availableReserveSources, allSources ] )

	return (
		<Select
			style={ { minWidth: 120, width: '100%' } }
			value={ { value: reservesSourceId } }
			labelInValue={ true }
			placeholder={ getText( 'reserves' ) }
			onChange={ v => {
				set_value( v )
				dispatch( { type: 'RESERVESSOURCEID', payload: v.value } )
			} }
		>
			{ options.map( src => (
				<Select.Option key={ src.sourceId }>{ src.label }</Select.Option> ) ) }
		</Select>
	)
}
