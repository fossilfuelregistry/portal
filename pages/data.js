import React from "react"
import TopNavigation from "components/navigation/TopNavigation"
import useText from "lib/useText"
import ReactMarkdown from "react-markdown"
import Footer from "components/Footer"

export default function Data() {
	const { getText } = useText()

	return (
		<div className="page">
			<TopNavigation/>

			<div className="page-padding">
				<ReactMarkdown>{ getText( 'page_data' ) }</ReactMarkdown>
			</div>

			<Footer/>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
