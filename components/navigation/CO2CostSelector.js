import React, { useState, useEffect } from 'react';
import { Select, Switch, Input } from "antd"
import useText from "../../lib/useText"
import { useDispatch, useSelector } from "react-redux"

const DEBUG = false

const CO2cCstSelector = () => {

	const { getText } = useText()
	const dispatch = useDispatch()
	const showCostInGraphs = useSelector( redux => redux.showCostInGraphs )
	const co2Costs = useSelector( redux => redux.co2Costs )
	const [ customValue, setCustomValue ] = useState ( "" )
	const [ currentPreDefinedValue, setCurrentPreDefinedValue ] = useState ( )
	const [ isUsingCustomValue, setIsUsingCustomValue ] = useState ( false )

	const formatCustomValue = ( value ) => ( { cost: value, currency: "USD", source: "custom" } )
	
	const dispatchCo2Cost = ( { source, currency, cost } ) => 
		dispatch( { type: 'CO2COSTPERTON', payload: { source, currency, cost } } )
	
	const getCosts = () => co2Costs.map( ( { source, currency, costPerTon } ) =>
		( { source, currency, cost: costPerTon } ) )
	
	const onTogglingCost = ( value ) => dispatch( { type: 'SHOWCOSTINGRAPHS', payload: value } )
	
	const onSelectCost = ( payload ) => {
		setCurrentPreDefinedValue( JSON.parse( payload ) )
		dispatchCo2Cost( JSON.parse( payload ) )
	}
	
	const onWriteCost = ( rawValue ) => {
		const value = rawValue.replace( /,/,"." ).replace( / /, "" )
		if( isNaN( Number( value ) ) ) return
		setCustomValue( value )
		dispatchCo2Cost( Number( value ) === 0  ? currentPreDefinedValue : formatCustomValue( value ) )
	}

	const onUsingCustomValue = () =>{
		if( !isUsingCustomValue ){
			const val = Number( customValue )
			if( !isNaN( val ) && val > 0 )
				dispatchCo2Cost( formatCustomValue( customValue ) )
		}
		else 
			dispatchCo2Cost( currentPreDefinedValue )
		setIsUsingCustomValue( !isUsingCustomValue )
	}

	useEffect( () => {
		const costs = getCosts()
		dispatchCo2Cost( costs?.[ 0 ] )
		setCurrentPreDefinedValue( costs?.[ 0 ]  )
	}, [ co2Costs ] );

	return (
		<>
			<div>
				<Switch onChange={()=>onTogglingCost( !showCostInGraphs )} value={showCostInGraphs} /> <span>{getText( 'menu_co2_cost_switch_label' )}</span>
			</div>
			{
				showCostInGraphs && (
					<>
						<div>
            
							<Select 
								style={ { minWidth: 120, width: '100%' } }
								value={ JSON.stringify(  currentPreDefinedValue ) } 
								onChange={onSelectCost}
								disabled={isUsingCustomValue}
							>
								{
									getCosts().map( cost => (
										<Select.Option value={JSON.stringify( cost )} key={JSON.stringify( cost )} >{`${ cost.cost.toFixed()} $US ${cost.source}`}</Select.Option>
									)
									)
								}
							</Select>
						</div> 

						<div>
							<Switch onChange={ onUsingCustomValue } value={isUsingCustomValue} /> <span>{ getText( 'menu_co2_cost_custom_value_label' ) }</span>
						</div>
						{
							isUsingCustomValue && (
								<div>
									<Input onChange={ e => onWriteCost( e.target.value )} value={customValue} placeholder="$US" />
								</div>
							)
						}
					</>
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
