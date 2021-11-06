import React from "react"
import TopNavigation from "components/navigation/TopNavigation"
import useText from "lib/useText"
import Markdown from "components/MarkdownCustomized"
import Footer from "components/Footer"

export default function About() {
	const { getText } = useText()

	return (
		<div className="static-page">
			<TopNavigation/>

			<div className="page-padding">
				<Markdown>{ getText( 'page_about' ) }</Markdown>
			</div>

			<Footer/>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
