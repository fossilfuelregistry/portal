import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"

const useCO2CostConverter = () => {
	const co2CostPerTon = useSelector( redux => redux.co2CostPerTon )
	const showCostInGraphs = useSelector( redux => redux.showCostInGraphs )
    
	const [ currentUnit, setCurrentUnit ] = useState( '' )
	const [ co2ToCostFactor, setCo2ToCostFactor ] = useState( 1 )

	useEffect( () => {
		if( showCostInGraphs && !!co2CostPerTon.currency ){
			setCurrentUnit( '$US mn' )
		}
		else {
			setCurrentUnit( 'CO²e MT' )
		}
		setCo2ToCostFactor( showCostInGraphs ? co2CostPerTon?.cost : 1 )
	}, [ co2CostPerTon, showCostInGraphs ] );

	return {
		currentUnit,
		costMultiplier: co2ToCostFactor
	}

}

export default useCO2CostConverter