import React, { useState, useRef } from 'react';
import { Select } from "antd"
import useText from "../../lib/useText"
import { useRouter } from "next/router"
import { useDispatch, useSelector, useStore } from "react-redux"

const DEBUG = false
const NOT_SELECTED = 'NOT_SELECTED'

const preDefinedCost = [{
    source:"SE",
    currency: "USD",
    cost: 150
},
{
    source:"GB",
    currency: "USD",
    cost: 180
}]

const CO2cCstSelector = () => {

    const { getText } = useText()
	const store = useStore()
	const router = useRouter()
	const [ selectedSourceOption, set_selectedSourceOption ] = useState()
	const dispatch = useDispatch()
	const co2CostPerTon = useSelector( redux => redux.co2CostPerTon )
	const project = useSelector( redux => redux.project )
	const firstInitialize = useRef( true ) // Used to NOT clear settings before sources loaded.

	const query = router.query


    const currentValue = co2CostPerTon ? JSON.stringify(co2CostPerTon) : NOT_SELECTED

    return (
        <div>
            <Select 
            style={ { minWidth: 120, width: '100%' } }
            value={ currentValue } 
            onChange={( payload ) => {
                DEBUG && console.log(payload)
                dispatch({
                    type: 'CO2COSTPERTON',
                    payload: payload === NOT_SELECTED ? null : JSON.parse(payload)
                })
            }}
            >
                <Select.Option value={ NOT_SELECTED }>{ getText('select_co2_price') }</Select.Option>
                {
                    preDefinedCost.map(cost => (
                        <Select.Option value={JSON.stringify(cost)} key={JSON.stringify(cost)} >{`${ cost.cost.toFixed()} ${cost.currency}`}</Select.Option>
                        )
                    )
                }
            </Select>
        </div>
    );
}

export default CO2cCstSelector;
