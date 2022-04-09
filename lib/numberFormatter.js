export const formatCsvNumber = number => isNaN( number ) ? undefined : parseFloat( number.toFixed( 4 ) )
