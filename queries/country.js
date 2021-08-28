import { gql } from "@apollo/client/core"

const _formatter = conditionObject => JSON.stringify( conditionObject ).replace( /"([^"]+)":/g, '$1:' ).replace( /\uFFFF/g, '\\\"' )

export const GQL_dataQuery = ( { iso3166, iso31662, projectId } ) => {
	const prod = _formatter( {
		iso3166,
		iso31662: iso31662 ?? '',
		projectId: projectId ?? '',
		projection: false
	} )
	const proj = _formatter( {
		iso3166,
		iso31662: iso31662 ?? '',
		projectId: projectId ?? '',
		projection: true
	} )
	const res = _formatter( {
		iso3166,
		iso31662: iso31662 ?? '',
		projectId: projectId ?? '',
	} )

	return {
		production: gql`
		query countryProduction {
		  countryProductions(
			condition: ${ prod }
			orderBy: YEAR_ASC
		  ) { nodes { id iso3166 fossilFuelType sourceId unit volume year } }
		}`,
		projection: gql`
		query countryProjection {
		  countryProductions(
			condition: ${ proj }
			orderBy: YEAR_ASC
		  ) { nodes { id iso3166 fossilFuelType sourceId unit volume year } }
		}`,
		reserves: gql`
		query countryReserves {
		  countryReserves(
			condition: ${ res }
			orderBy: YEAR_ASC
		  ) { nodes { id iso3166 fossilFuelType grade sourceId unit volume quality year } }
		}`
	}
}

export const GQL_countryReservesByIso = gql`
query countryReserves($iso3166: String!) {
  countryReserves(
  	condition: { iso3166: $iso3166 }
  	orderBy: YEAR_ASC
  ) {
    nodes { id iso3166 fossilFuelType grade sourceId unit volume quality year }
  }
}`

export const GQL_countryBorder = gql`
query border($isoA2: String!, $iso3166: String!) {
  neCountries(condition: {isoA2: $isoA2}) {
    nodes { geometry { geojson srid } isoA2 }
  }
  projects(condition: {iso3166: $iso3166}) {
    nodes { geoPosition { geojson srid } projectIdentifier }
  }
}`

export const GQL_countryProductionByIso = gql`
query countryProductions($iso3166: String!) {
  countryProductions(
  	condition: { iso3166: $iso3166 }
    filter: {fossilFuelType: {in: ["oil", "gas"]}}
  	orderBy: YEAR_ASC
  ) {
    nodes { id iso3166 fossilFuelType sourceId unit volume year projection }
  }
}`

export const GQL_countryCurrentProduction = gql`
query countryCurrentProduction($iso3166: String!) {
  getCountryCurrentProduction(iso3166_: $iso3166) {
    nodes { id fossilFuelType sourceId unit volume year }
  }
}`

export const GQL_sparseProject = gql`
query sparseProject($projectId: String!, $iso3166: String!) {
  sparseProjects(condition: {projectId: $projectId, iso3166: $iso3166}) {
    nodes {
      id iso3166 iso31662 linkUrl methaneM3Ton
      geoPosition { geojson srid }
      description locationName ocOperatorId operatorName productionCo2E
      productionMethod productionType projectId region sourceProjectId sourceProjectName
      sparseDataPoints { nodes { dataType fossilFuelType grade quality subtype unit volume year } }
    }
  }
}`

export const GQL_largestProjects = gql`
query largestProjects($iso3166:String!){
  projects(
    orderBy: PRODUCTION_CO2E_DESC
    condition: {iso3166: $iso3166}
    first: 10
  ) { nodes { iso3166 projectIdentifier productionCo2E geoPosition { geojson srid } } }
}`

export const GQL_projectGeo = gql`
query projectGeo($projectIdentifier: String!, $iso3166: String!) {
  projects(condition: {projectIdentifier: $projectIdentifier, iso3166: $iso3166}) {
    nodes { projectIdentifier geoPosition { geojson srid } }
  }
}`
