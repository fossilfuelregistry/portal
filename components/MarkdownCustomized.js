import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkHeadingId from 'remark-heading-id'

export default function Markdown( { children } ) {
	return (
		<ReactMarkdown remarkPlugins={ [ [ remarkGfm, { singleTilde: false } ], [ remarkHeadingId ] ] }>
			{ children }
		</ReactMarkdown> )
}