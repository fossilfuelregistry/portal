import React, { useMemo, useState } from "react"
import useText from "lib/useText"
import FossilFuelTypeSelector from "../navigation/FossilFuelTypeSelector"
import { Col, Input, Alert, Row, Select } from "antd"
import CountrySelectorStandalone from "../navigation/CountrySelectorStandalone"
import { useConversionHooks } from "../viz/conversionHooks"
import ScopeBars from "../viz/ScopeBars"

const DEBUG = false

export default function Calculator() {
	const { getText } = useText()
	const [ fuel, set_fuel ] = useState( undefined )
	const [ volume, set_volume ] = useState( undefined )
	const [ unit, set_unit ] = useState( undefined )
	const [ iso3166, set_iso3166 ] = useState( undefined )
	const { co2FromVolume } = useConversionHooks()

	const units = useMemo( () => {
		const barrels = getText( 'barrels' )
		const ton = getText( 'ton' )
		return ( {
			oil: {
				e6m3: 'M m³',
				e3m3: 'k m³',
				e6bbl: 'M ' + barrels,
				e3bbls: 'k ' + barrels,
			},
			gas: {
				e9m3: 'G m³',
				e6m3: 'M m³',
				e9feet3: 'G feet³',
			},
			coal: {
				e3shorttons: 'k Shorttons',
				e6ton: 'M ' + ton,
			}
		} )
	}, [] )

	DEBUG && console.info( 'InputSummary', {} )

	try {
		let result = {}
		if( !!fuel && !!volume && !!unit ) {
			result = co2FromVolume( { volume, unit, fossilFuelType: fuel, country: iso3166 } )
		}

		return (
			<div className="table-wrap">
				<Row gutter={ [ 12, 12 ] }>

					<Col xs={ 24 }>
						<FossilFuelTypeSelector
							onChange={ f => {
								set_unit( undefined )
								set_fuel( f )
							} }
						/>
					</Col>

					<Col xs={ 24 }>
						<CountrySelectorStandalone
							onChange={ c => set_iso3166( c?.value ) }
							placeholder={ getText( 'origin_country' ) + '...' }
						/>
					</Col>

					<Col xs={ 12 }>
						<Input
							type="number"
							onChange={ e => set_volume( parseFloat( e.target.value ) ) }
							placeholder={ getText( 'quantity' ) }
						/>
					</Col>

					<Col xs={ 12 }>
						<Select
							disabled={ !fuel }
							style={ { minWidth: 120, width: '100%' } }
							value={ unit }
							placeholder={ getText( 'unit' ) + '...' }
							onChange={ set_unit }
						>
							{ Object.keys( units[ fuel ] ?? [] ).map( unit => (
								<Select.Option key={ unit }>{ units[ fuel ][ unit ] }</Select.Option>
							) ) }
						</Select>
					</Col>

					<Col xs={ 24 }>
						{ result.scope3 &&
						<div style={ { textAlign: 'center' } } >
							<div className="svg-wrap">
								<ScopeBars totals={ result }/>
							</div>
							<h4> < span className="title">{ getText( 'emissions' ) }</span> (M { getText( 'ton' ) } CO²e)</h4>
						</div> }
					</Col>
				</Row>

				<style jsx>{ `
              .vspace > :global(input),
              .vspace > :global(div) {
                margin-bottom: 12px;
              }

              .table-wrap :global(svg) {
                display: grid;
                margin: 0 auto;
              }

              .title {
                text-transform: capitalize;
              }

              .svg-wrap {
                min-height: 250px;
                display: table;
                width: 100%;
              }

              .svg-wrap > :global(div) {
                display: table-cell;
              }
			` }
				</style>
			</div> )
	} catch( e ) {
		console.log( e )
		return <Alert showIcon type="error" message={'Application error'} description={e.message} />
	}
}
