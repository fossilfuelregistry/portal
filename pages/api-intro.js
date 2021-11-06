import React from "react"
import TopNavigation from "components/navigation/TopNavigation"
import useText from "lib/useText"
import Markdown from "components/MarkdownCustomized"
import Footer from "components/Footer"

export default function ApiIntro() {
	const { getText } = useText()

	return (
		<div className="static-page">
			<TopNavigation/>

			<div className="page-padding">
				<h2>{ getText( 'API_header' ) }</h2>
				<Markdown>{ getText( 'API_intro' ) }</Markdown>
			</div>

			<Footer/>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
