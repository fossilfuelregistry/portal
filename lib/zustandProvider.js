import { createContext, useContext } from 'react'

export const StoreContext = createContext( null )

export const StoreProvider = ( { children, store } ) => {
	// console.log( '<StoreProvider>' )
	return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export const useStore = ( selector, eqFn ) => {
	const store = useContext( StoreContext )
	const values = store( selector, eqFn )
	return values
}

// Static selectors should be defined outside render context.
export const textsSelector = state => state.texts
export const conversionsSelector = state => state.conversions
export const ipSelector = state => state.ip
export const ipLocationSelector = state => state.ipLocation
