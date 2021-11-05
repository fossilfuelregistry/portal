import React from "react"
import TopNavigation from "components/navigation/TopNavigation"
import useText from "lib/useText"
import ReactMarkdown from "react-markdown"
import Footer from "components/Footer"

export default function About() {
	const { getText } = useText()

	return (
		<div className="page">
			<TopNavigation/>

			<div className="page-padding">
				<h2>{ getText( 'about_header' ) }</h2>
				<ReactMarkdown>{ getText( 'page_about' ) }</ReactMarkdown>
			</div>

			<Footer/>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
