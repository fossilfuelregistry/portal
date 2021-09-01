import React from 'react'
import ReactMarkdown from "react-markdown"
import { Col, Row, Select } from "antd"
import { useRouter } from "next/router"
import useText from "../lib/useText"

function Footer() {
	const router = useRouter() ?? {}
	const { getText } = useText()

	return (
		<div className="footer">
			<div className="page-padding">

				<Row gutter={ 24 }>

					<Col xs={ 24 } md={ 12 } lg={ 8 }> <a href="http://creativecommons.org/licenses/by-sa/4.0/">
						<img src="/cc.svg" alt="CC-BY-SA" className="cc"/>
					</a>
						&nbsp;&nbsp;
					<ReactMarkdown>{ getText( 'data_license' ) }</ReactMarkdown>
					</Col>

					<Col xs={ 24 } md={ 12 } lg={ 8 }>
						<div>{ getText( 'language' ) }</div>
						<Select
							size="small"
							style={ { width: 150 } }
							value={ router.locale }
							onChange={ async value => {
								await router.push( router.asPath, router.asPath, { locale: value } )
							} }
							placeholder={ getText( 'language' ) + '...' }
						>
							<Select.Option key={ 'en' }>EN</Select.Option>
							<Select.Option key={ 'fr' }>FR</Select.Option>
							<Select.Option key={ 'es' }>ES</Select.Option>
						</Select>
					</Col>
				</Row>

			</div>

			<style jsx>{ `
              .footer :global(.cc) {
                height: 32px;
              }

              .footer {
                margin-top: 20px;
                border-top: 1px solid #dddddd;
              }

              @media (max-width: 500px) {
                .footer :global(.cc) {
                  height: 18px;
                }
              }
			` }
			</style>
		</div>
	)
}

export default Footer