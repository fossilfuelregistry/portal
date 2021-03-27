import { useMemo } from 'react'
import { devtools } from 'zustand/middleware'
import create from 'zustand'

let store

const initialState = {}

function initStore( preloadedState = initialState ) {
	// console.log('initStore()', preloadedState)

	return create( devtools( ( set, get ) => ( {
		...initialState,
		...preloadedState,
	} ) ) )
}

export const initializeStore = ( preloadedState ) => {
	// console.log('initializeStore()', store, preloadedState)
	let _store = store ?? initStore( preloadedState )

	// After navigating to a page with an initial Zustand state, merge that state
	// with the current state in the store, and create a new store
	if( preloadedState && store ) {
		_store = initStore( {
			...store.getState(),
			...preloadedState,
		} )
		// Reset the current store
		store = undefined
	}

	// For SSG and SSR always create a new store
	if( typeof window === 'undefined' ) return _store
	// Create the store once in the client
	if( !store ) store = _store

	return _store
}

export function useHydrate( initialState ) {
	//console.log('useHydrate()', initialState)
	const state = typeof initialState === 'string' ? JSON.parse( initialState ) : initialState
	return useMemo( () => initializeStore( state ), [ state ] )
}
