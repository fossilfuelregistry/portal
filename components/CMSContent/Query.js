import React from 'react'
import { gql, useQuery } from "@apollo/client"
import { Table } from "antd"

const sorter = {
	string: ( a, b, c ) => a[ c ].localeCompare( b[ c ] ),
	number: ( a, b, c ) => Math.sign( a[ c ] - b[ c ] )
}

export default function Query( { block } ) {
	const cols = Object.keys( block.Columns ) ?? []

	const query = gql`
	query ${ block.query } {
	  ${ block.query } {
		nodes { ${ cols.join( ' ' ) } }
	  }
	}`

	const { data, loading, error } = useQuery( query )

	const columns = cols.map( c => {
		let title = block.Columns[ c ]
		let type = 'string'
		if( title.includes( ':' ) ) {
			const s = title.split( ':' )
			title = s[ 0 ]
			type = s[ 1 ]
		}
		return {
			title,
			dataIndex: c,
			key: c,
			sorter: ( a, b ) => sorter[ type ]?.( a, b, c ),
			type
		}
	} )

	console.log( columns )

	return (
		<div className="query">
			<Table
				columns={ columns }
				dataSource={ data?.[ block.query ]?.nodes }
				size="small"
			/>
		</div>
	)
}
