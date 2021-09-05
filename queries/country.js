import { gql } from "@apollo/client/core"

export const GQL_countrySources = gql`
query countrySource( $iso3166: String = "", $iso31662: String = "") {
  getCountrySources(iso3166_: $iso3166, iso31662_: $iso31662) {
    nodes { dataPoints dataType description latestCurationAt name namePretty sourceId year records url quality grades }
  }
}`

export const GQL_countryProduction = gql`
query production( $iso3166: String! $iso31662: String! ) {
  countryDataPoints(
  	orderBy: YEAR_ASC
    condition: { iso3166: $iso3166 iso31662: $iso31662 dataType: PRODUCTION }
  ) {
    nodes { fossilFuelType volume year unit subtype sourceId quality }
  }
}`

export const GQL_countryReserves = gql`
query reserves( $iso3166: String! $iso31662: String! ) {
  countryDataPoints(
  	orderBy: YEAR_ASC
    condition: { iso3166: $iso3166 iso31662: $iso31662 dataType: RESERVE }
  ) {
    nodes { fossilFuelType volume year unit subtype sourceId quality grade }
  }
}`

export const GQL_countryProjection = gql`
query projection( $iso3166: String! $iso31662: String! ) {
  countryDataPoints(
  	orderBy: YEAR_ASC
    condition: { iso3166: $iso3166 iso31662: $iso31662 dataType: PROJECTION }
  ) {
    nodes { fossilFuelType volume year unit subtype sourceId quality }
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

export const GQL_countryCurrentProduction = gql`
query countryCurrentProduction($iso3166: String!) {
  getCountryCurrentProduction(iso3166_: $iso3166) {
    nodes { id fossilFuelType sourceId unit volume year subtype }
  }
}`

export const GQL_projectProduction = gql`
query production( $id: Int! ) {
  projectDataPoints(
  	orderBy: YEAR_ASC
    condition: { projectId: $id dataType: PRODUCTION }
  ) {
    nodes { fossilFuelType volume year unit subtype sourceId quality }
  }
}`

export const GQL_projectReserves = gql`
query reserves( $id: Int! ) {
  projectDataPoints(
  	orderBy: YEAR_ASC
    condition: { projectId: $id dataType: RESERVE }
  ) {
    nodes { fossilFuelType volume year unit subtype sourceId quality grade }
  }
}`

export const GQL_projectProjection = gql`
query projection( $id: Int! ) {
  projectDataPoints(
  	orderBy: YEAR_ASC
    condition: { projectId: $id dataType: PROJECTION }
  ) {
    nodes { fossilFuelType volume year unit subtype sourceId quality }
  }
}`

export const GQL_project = gql`
query project($id: Int!) {
  project(id: $id) {
    id dataYear description
    geoPosition { geojson srid }
    iso3166 iso31662 linkUrl locationName methaneM3Ton ocOperatorId operatorName productionCo2E
    productionMethod productionType projectIdentifier projectType region sourceProjectId sourceProjectName
    projectDataPoints { nodes { dataType fossilFuelType quality sourceId subtype unit volume year grade dataYear } }
  }
}`

export const GQL_largestProjects = gql`
query largestProjects($iso3166:String!){
  projects(
    orderBy: PRODUCTION_CO2E_DESC
    condition: {iso3166: $iso3166}
    first: 10
  ) { nodes { id iso3166 projectIdentifier productionCo2E projectType geoPosition { geojson srid } } }
}`

export const GQL_projectGeo = gql`
query projectGeo($projectIdentifier: String!, $iso3166: String!) {
  projects(condition: {projectIdentifier: $projectIdentifier, iso3166: $iso3166}) {
    nodes { projectIdentifier geoPosition { geojson srid } }
  }
}`
