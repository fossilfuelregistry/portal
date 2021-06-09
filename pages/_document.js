import Document, { Html, Head, Main, NextScript } from 'next/document'
import { Divider } from "antd"

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

					<script
						type="application/javascript"
						dangerouslySetInnerHTML={ {
							__html: `function OptanonWrapper() { }`
						} }
					/>

					<script
						async defer data-website-id="1c29de0e-0dd9-435f-a24d-13a32b9d3ef0"
						src="https://gffr-log.journeyman.se/umami.js"
					/>

				</Head>
				<body>
					<Main/>
					<NextScript/>
					<div style={ { marginTop: 20, padding: '8px 40px', borderTop: '1px solid #dddddd' } }>
						<a href="http://creativecommons.org/licenses/by-sa/4.0/">
							<img src="/cc.svg" alt="CC-BY-SA" height={ 32 }/>&nbsp;&nbsp;
							All data is licensed under CC-BY-SA
						</a>
					</div>
				</body>
			</Html>
		)
	}
}
