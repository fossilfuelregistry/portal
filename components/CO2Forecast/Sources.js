import useText from "lib/useText"
import React from "react"
import { useSelector } from "react-redux"
import { Button, Modal } from 'antd'

const DEBUG = true

export default function Sources( { production, reserves, projection } ) {
	const { getText } = useText()
	const allSources = useSelector( redux => redux.allSources )
	const [ modal, contextHolder ] = Modal.useModal()

	const _renderSourceList =
		sources => sources.map( s =>
			<React.Fragment key={ s.sourceId }>
				<span>
					<Button
						size="small"
						onClick={ () => {
							console.log( 'CLICK', { s, modal } )
							modal.info( {
								title: (
									<a href={ s.url }>{ s.namePretty?.startsWith( 'name_' ) ? getText( s.namePretty ) : s.namePretty }</a>
								),
								content: (
									<>
										{s.description?.startsWith( 'explanation_' ) ? getText( s.description ) : s.description}
										<br/>
										{getText( '' )}
									</>
								)
							} )
						} }
					>
						{ s.name?.startsWith( 'name_' ) ? getText( s.name ) : s.name }
					</Button>
					{ ' ' }
				</span>
			</React.Fragment>
		)

	const _reserves = reserves.map( r => allSources.find( s => s.sourceId === r.sourceId ) )
	DEBUG && console.log( { production, reserves: _reserves, projection } )

	return (
		<div className="co2-card">
			<div className="header">{ getText( 'data_sources' ) }</div>
			<div className="box">
				{ contextHolder }
				<div>
					<b>{ getText( 'production' ) }: </b>
					{ _renderSourceList( production ) }
				</div>
				<div>
					<b>{ getText( 'reserves' ) }: </b>
					{ _renderSourceList( _reserves ) }
				</div>
				<div>
					<b>{ getText( 'projection' ) }: </b>
					{ _renderSourceList( projection ) }
				</div>
				<div>{ '' }</div>
			</div>
		</div>
	)
}
