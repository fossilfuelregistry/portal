export async function getUserIP() {
	if( typeof window === 'undefined' ) return '0.0.0.0'
	try {
		const api = await fetch( 'https://icanhazip.com' )
		if( !api.ok ) throw new Error( 'IP Lookup ' + api.status + ' ' + api.statusText )
		const ip = await api.text()
		//console.log( 'getUserIP', ip )
		return ip.replace( '\n', '' )
	} catch( e ) {
		console.log( 'IP Lookup fail:', e.message )
	}
}
