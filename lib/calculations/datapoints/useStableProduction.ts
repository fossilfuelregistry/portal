import { useQuery } from "@apollo/client"
import { Store } from "lib/types"
import { GQL_countrySources } from "queries/country"
import { useDispatch, useSelector } from "react-redux"

export const useCountryProduction = () => {
    const dispatch = useDispatch()
    const country = useSelector( (redux: Store) => redux.country )
	const region = useSelector( (redux: Store) => redux.region )

	const { data: _countrySources, loading: cLoad } = useQuery( GQL_countrySources, {
		variables: { iso3166: country, iso31662: region },
		skip: !country
	} )

    
    const reset = () => dispatch({ type: 'STABLEPRODUCTION', payload: null })
    const stableProduction = useSelector((redux: Store)=>redux.stableProduction)

    return {reset}
}

function pageQuery() {
    throw new Error("Function not implemented.")
}
