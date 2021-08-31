import useText from "lib/useText"
import React from "react"
import { useSelector } from "react-redux"
import { Button, Modal } from 'antd'
import { ExportOutlined } from "@ant-design/icons"
import { useRouter } from "next/router"
import ReactMarkdown from "react-markdown"

const DEBUG = false

export default function Sources( { production, reserves, projection } ) {
	const { getText } = useText()
	const router = useRouter()
	const allSources = useSelector( redux => redux.allSources )
	const [ modal, contextHolder ] = Modal.useModal()

	const _renderSourceList =
		sources => sources.map( s => {
			if( !s?.sourceId ) return null
			return (
				<React.Fragment key={ s.sourceId }>
					<span>
						<Button
							size="small"
							onClick={ () => {
								console.log( 'CLICK', { s, modal } )
								modal.info( {
									title: (
										<span>
											{ s.namePretty?.startsWith( 'name_' ) ? getText( s.namePretty ) : s.namePretty }
											{ ' ' }
											<a href={ s.url }><ExportOutlined/></a>
										</span>
									),
									content: (
										<>
											<div
												style={ { marginBottom: 8 } }
											>{ s.description?.startsWith( 'explanation_' ) ? <ReactMarkdown>{ getText( s.description ) }</ReactMarkdown> : s.description }
											</div>

											{ s.documentUrl &&
											<Button onClick={ () => router.push( s.documentUrl ) }>
												{ getText( 'document_repository' ) }
											</Button>
											}

											{ s.latestCurationAt &&
											<div style={ {
												marginTop: 8,
												marginBottom: 8,
												fontSize: 12
											} }
											>{ getText( 'latest_curation_date' ) } { s.latestCurationAt }
											</div> }

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
		} )

	const _reserves = reserves?.map( r => allSources.find( s => s.sourceId === r.sourceId ) )
	DEBUG && console.log( { production, reserves: _reserves, projection } )

	return (
		<div className="co2-card">
			<div className="header">{ getText( 'data_sources' ) }</div>
			<div className="box" style={ { minHeight: 'unset' } }>
				{ contextHolder }

				{ production?.length > 0&&
				<div>
					<b>{ getText( 'production' ) }: </b>
					{ _renderSourceList( production ) }
				</div> }

				{ _reserves?.length > 0 &&
				<div>
					<b>{ getText( 'reserves' ) }: </b>
					{ _renderSourceList( _reserves ) }
				</div> }

				{ projection?.length > 0 &&
				<div>
					<b>{ getText( 'projection' ) }: </b>
					{ _renderSourceList( projection ) }
				</div> }

				<div>{ '' }</div>
			</div>
		</div>
	)
}
