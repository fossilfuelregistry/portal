import React, { useState, useRef, useEffect } from 'react';
import { Select, Switch } from "antd"
import useText from "../../lib/useText"
import { useRouter } from "next/router"
import { useDispatch, useSelector, useStore } from "react-redux"

const DEBUG = false
const NOT_SELECTED = 'NOT_SELECTED'

const CO2cCstSelector = () => {

	const { getText } = useText()
	const store = useStore()
	const router = useRouter()
	const [ selectedSourceOption, set_selectedSourceOption ] = useState()
	const dispatch = useDispatch()
	const co2CostPerTon = useSelector( redux => redux.co2CostPerTon )
	const showCostInGraphs = useSelector( redux => redux.showCostInGraphs )
	const co2Costs = useSelector( redux => redux.co2Costs )
	const project = useSelector( redux => redux.project )
	const firstInitialize = useRef( true ) // Used to NOT clear settings before sources loaded.

	const [ costs, setCosts ] = useState( [] )
	
	useEffect( () => {
		const _costs = co2Costs.map( ( { source, currency, costPerTon } )=>( {
			source,
			currency,
			cost: costPerTon
		} ) )

		setCosts( _costs )
	}, [ co2Costs ] );

	const currentValue = co2CostPerTon ? JSON.stringify( co2CostPerTon ) : NOT_SELECTED
    
	const onTogglingCost = ( value ) => {
		dispatch( {
			type: 'SHOWCOSTINGRAPHS',
			payload: value
		} )
	}

	const onSelectCost = ( payload ) => {
		if( payload === NOT_SELECTED ) onTogglingCost( false )

		dispatch( {
			type: 'CO2COSTPERTON',
			payload: payload === NOT_SELECTED ? null : JSON.parse( payload )
		} )
	}

	return (
		<>
			<div>
            
				<Select 
					style={ { minWidth: 120, width: '100%' } }
					value={ currentValue } 
					onChange={onSelectCost}
				>
					<Select.Option value={ NOT_SELECTED }>{ getText( 'select_co2_price' ) }</Select.Option>
					{
						costs.map( cost => (
							<Select.Option value={JSON.stringify( cost )} key={JSON.stringify( cost )} >{`${ cost.cost.toFixed()} ${cost.currency} ${cost.source}`}</Select.Option>
						)
						)
					}
				</Select>
			</div>

			{
				co2CostPerTon && (
					<div>
						<Switch onChange={()=>onTogglingCost( !showCostInGraphs )} /> <label>Display cost in graphs</label>
					</div>
				)
			}


			<style jsx>{ `
          div {
            margin-bottom: 6px !important;
          }
		` }
			</style>
		</>
	);
}

export default CO2cCstSelector;
