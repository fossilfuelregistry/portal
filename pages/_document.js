import React from "react"
import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head>
					<link rel="icon" type="image/png" href="/favicon.png"/>
					<link href="/fonts/style.css" rel="stylesheet"/>
					<script
						type="text/javascript"
						src="https://cdn.cookielaw.org/consent/78d11342-08d5-4084-a887-79f448fb6b96-test/OtAutoBlock.js"
					/>

					<script
						type="text/javascript"
						src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
						charSet="UTF-8"
						data-domain-script="78d11342-08d5-4084-a887-79f448fb6b96-test"
					/>

					{ process.env.NEXT_PUBLIC_GA &&
					<script
						async
						src={ "https://www.googletagmanager.com/gtag/js?id=" + process.env.NEXT_PUBLIC_GA }
					/> }

					{ process.env.NEXT_PUBLIC_GA &&
					<script
						type="application/javascript"
						dangerouslySetInnerHTML={ {
							__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){window.dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', '${ process.env.NEXT_PUBLIC_GA }');`
						} }
					/> }

				</Head>
				<body>
					<Main/>
					<NextScript/>
				</body>
			</Html>
		)
	}
}
