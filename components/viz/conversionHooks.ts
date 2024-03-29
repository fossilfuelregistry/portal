import  { useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
	co2PageUpdateQuery,
	getFullFuelType,
	getPreferredGrades,
	sumOfCO2,
} from "components/CO2Forecast/calculate";
import { useApolloClient } from "@apollo/client";
import { GQL_countryCurrentProduction } from "queries/country";
import { notification } from "antd";
import _trottle from "lodash/throttle";
import settings from "settings";
import { useRouter } from "next/router";
import useText from "lib/useText";
import {
	CountryConversionGraphs,
	FossilFuelType,
	Graphs,
	Store,
	Conversions,
	EmissionFactors,
	ProductionData,
	Limits,
	ReservesData,
	ProjectionData,
	LastReservesType,
	ProjectDataRecord,
} from "lib/types";
import {
	extractAllFuels,
	convertVolume as _convertVolume,
	buildGraphsFromFuels,
} from "lib/calculations/conversion-hook/conversions";
import { GQL_countryCurrentProductionRecord } from "queries/country-types";
import notificationError from "lib/calculations/notification-error";
import { useCalculate } from "lib/calculations/use-calculate";
import {
	GetConstants,
	useCalculationConstants,
} from "lib/calculations/calculation-constants/use-calculation-constants";

import * as O from "fp-ts/Option";
import { toVintageCO2ERepresentation } from "lib/calculations/utils";
import { pipe } from "fp-ts/lib/function";
import { captureException } from "@sentry/nextjs";

const DEBUG = false;

let lastConversionPath: string[] = [];
let lastConversionLoggedTimer: NodeJS.Timeout;

// Store conversion graph data globally to avoid recalculation for each instance.
// One graph per fully qualified fuel type contains the possible conversion paths for that fuel.
// The corresponding conversion factors are in the conversions object.
let graphs: Graphs | undefined,
	conversions: Conversions | undefined,
	_country: string | null | undefined,
	_length: number | undefined;

let __graph; // For debug output in catch scope

export const useConversionHooks = () => {
	const conversionConstants = useSelector( ( redux: Store ) => redux.conversions );
	const allSources = useSelector( ( redux: Store ) => redux.allSources );
	const gwp = useSelector( ( redux: Store ) => redux.gwp );
	const country = useSelector( ( redux: Store ) => redux.country );
	const stableProduction = useSelector(
		( redux: Store ) => redux.stableProduction
	);
	const apolloClient = useApolloClient();

	const { getText } = useText();
	const router = useRouter();
	const store = useStore();
	const dispatch = useDispatch();
	const query = useRef( {} );
	const calculate = useCalculate();

	const getCalculationConstants = useCalculationConstants();

	// Parse query from URL - this avoids delay in query params by next js router
	useEffect( () => {
		const urlQuery = new URLSearchParams( router.asPath.split( "?" )[ 1 ] );
		Array.from( urlQuery.entries() ).forEach( ( [ key, value ] ) => {
			// @ts-ignore
			query.current[ key ] = value;
		} );
	}, [ router.asPath ] );

	// Build unit graphs for all fuels.
	useEffect( () => {
		DEBUG &&
      console.info( "useEffect build conversion graphs", {
      	conversionConstants,
      	country,
      	_country,
      	graphs,
      } );
		if ( !( conversionConstants?.length > 0 ) ) return;
		const ccGraphs = countryConversionGraphs();

		if (
			country === _country &&
      _length === conversionConstants?.length &&
      graphs
		)
			return;

		DEBUG &&
      console.info( {
      	ccGraphs,
      	country,
      	l: conversionConstants?.length,
      	graphs,
      	conversions,
      	_length,
      	_country,
      } );

		graphs = ccGraphs.graphs;
		conversions = ccGraphs.conversions;
		_country = country;
		_length = conversionConstants?.length;
		DEBUG && console.info( "useEffect graphs:", { graphs, conversions } );
	}, [ conversionConstants?.length, country, graphs === undefined ] );

	const sourceNameFromId = ( sourceId: number ): string => {
		const source = allSources.find( ( s ) => s.sourceId === sourceId );
		if ( !source ) return "[sourceId " + sourceId + " not found]";
		if ( source.name.startsWith( "name_" ) ) return getText( source.name );
		return source.name;
	};

	const countryConversionGraphs = (
		countryOverride?: string
	): CountryConversionGraphs => {
		const fuels = extractAllFuels( conversionConstants );
		DEBUG && console.info( { fuels } );

		const currentCountry = countryOverride ?? country;
		if ( !currentCountry ) return { graphs: {}, conversions: {} };
		return buildGraphsFromFuels( fuels, currentCountry, conversionConstants );
	};

	const conversionPathLoggerReset = () => ( lastConversionPath = [] );

	const pageQuery = () => {
		return { ...query.current, ...router.query };
	};

	const goToCountryOverview = async () => {
		dispatch( { type: "REGION", payload: undefined } );
		dispatch( { type: "PROJECT", payload: undefined } );
		dispatch( { type: "PRODUCTIONSOURCEID", payload: undefined } );
		dispatch( { type: "RESERVESSOURCEID", payload: undefined } );
		dispatch( { type: "PROJECTIONSOURCEID", payload: undefined } );
		dispatch( { type: "STABLEPRODUCTION", payload: undefined } );
		await co2PageUpdateQuery( store, router );
	};

	const convertVolume = (
		{
			volume,
			unit,
			fossilFuelType,
		}: {
      volume: number;
      unit: string;
      fossilFuelType: FossilFuelType;
    },
		toUnit: string
	): number => {
		if ( !graphs || !conversions ) return 0;
		return _convertVolume(
			{ volume, unit, fossilFuelType, toUnit },
			graphs,
			conversions
		);
	};

	const _co2Factors = (
		{ graphs, conversions }: { graphs: Graphs; conversions: Conversions },
		unit: string,
		toUnit: string,
		fullFuelType: string,
		log: any,
		volume: number
	): EmissionFactors => {
		const graph = graphs[ fullFuelType ];
		const conversion = conversions[ fullFuelType ];
		if ( !graph ) throw new Error( "No conversion graph for " + fullFuelType );
		if ( !conversion )
			throw new Error( "No conversion factors for " + fullFuelType );

		const path = graph.shortestPath( unit, toUnit );
		let pathAsString = unit + " > ";

		let factor = 1,
			low = 1,
			high = 1;
		for ( let step = 1; step < path.length; step++ ) {
			const from = path[ step - 1 ];
			const to = path[ step ];
			const conv = conversion[ from + ">" + to ];

			if ( !conv )
				throw new Error(
					`Conversion data issue: From ${from} to ${to} for ${fullFuelType} is ${JSON.stringify(
						conv
					)}`
				);
			const { factor: stepFactor, low: stepLow, high: stepHigh } = conv;

			factor *= stepFactor;
			low *= stepLow ?? stepFactor;
			high *= stepHigh ?? stepFactor;
			pathAsString +=
        to + ( conv.country ? "(" + conv.country + ")" : "" ) + " > ";

			//const DEBUG = fullFuelType === 'coal'
			if ( DEBUG || log )
				console.info(
					from,
					to,
					stepFactor,
					volume * factor,
					conv.country ? "(" + conv.country + ")" : ""
				);
		}

		DEBUG &&
      console.info( fullFuelType + " Path ", {
      	factor,
      	unit,
      	toUnit,
      	path,
      	conversion,
      } );

		const logString =
      "[" +
      fullFuelType +
      "] " +
      pathAsString.substring( 0, pathAsString.length - 3 );
		if ( !lastConversionPath.includes( logString ) )
			lastConversionPath.push( logString );

		if ( lastConversionLoggedTimer ) clearTimeout( lastConversionLoggedTimer );
		lastConversionLoggedTimer = setTimeout( () => {
			if ( DEBUG ) {
				console.info( "----- Conversions logged -----" );
				lastConversionPath
					.sort( ( a, b ) => a.localeCompare( b ) )
					.forEach( ( p ) => console.info( p ) );
			}
			lastConversionPath = [];
		}, 1000 );
		return { low, high, factor };
	};

	// Avoid overloading browser with notifications when there is an error.
	const _throttled_notification = _trottle(
		( volume, unit, fossilFuelType, subtype, methaneM3Ton, country ) => {
			captureException( {
				message: "CO2 Calc, no unit graph available",
				description: {
					volume,
					unit,
					fossilFuelType,
					subtype,
					methaneM3Ton,
					country,
				},
			} )
			notification.warning( {
				message: "CO2 Calc, no unit graph available",
				description: JSON.stringify( {
					volume,
					unit,
					fossilFuelType,
					subtype,
					methaneM3Ton,
					country,
				} ),
			} );
			console.info( "CO2 Calc, no unit graph available" );
			console.info( {
				graphs,
				conversions,
				volume,
				unit,
				fossilFuelType,
				subtype,
				methaneM3Ton,
				country,
			} );
		},
		2000,
		{ trailing: false }
	);

	const __co2FromVolume = (
		props: ProductionData | GQL_countryCurrentProductionRecord,
		log?: any | undefined
	) => {
		//console.info("co2FromVolume", {props, log})
		if ( !props ) return { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] };
		// @ts-ignore
		const { volume, unit, fossilFuelType, subtype, methaneM3Ton, country } =
      props;

		let gc = { graphs, conversions };
		if ( country ) {
			// We want to override graphs to this country instead of the Redux state country
			gc = countryConversionGraphs( country );
			DEBUG &&
        console.info(
        	"Country Override:",
        	country,
        	volume,
        	unit,
        	fossilFuelType,
        	gc
        );
		}

		if ( gc.graphs === undefined ) {
			_throttled_notification(
				volume,
				unit,
				fossilFuelType,
				subtype,
				methaneM3Ton,
				country
			);
			return { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] };
		}

		const fullFuelType = getFullFuelType( { fossilFuelType, subtype } );
		if ( !fullFuelType ) {
			console.error( "No fuel type found", { fossilFuelType, subtype } );
			throw new Error( "No fuel type found" );
		}
		const graph = gc.graphs[ fullFuelType as FossilFuelType ];
		if ( !graph ) {
			console.info( "No unit conversion graph for " + fullFuelType );
			console.info( graphs );
			// @ts-ignore
			throw new Error(
				"No unit conversion graph for " +
          fullFuelType +
          " in " +
          Object.keys( graphs ?? {} )
			);
		}

		let scope1 = {},
			scope3;
		const toScope1Unit = "kgco2e" + settings.fuelTypeSeparator + gwp;

		log && console.info( "-----", country, fossilFuelType, volume, unit );
		try {
			log && console.info( "--S1--" );
			scope1 = _co2Factors( gc, unit, toScope1Unit, fullFuelType, log, volume );
		} catch ( e ) {
			DEBUG &&
        console.info(
        	`Scope 1 ${toScope1Unit} Conversion Error:  ${e.message}`,
        	{
        		unit,
        		toUnit: toScope1Unit,
        		fullFuelType,
        		graph: graph.serialize(),
        	}
        );
			captureException( e )
		}

		try {
			log && console.info( "--S3--" );
			scope3 = _co2Factors( gc, unit, "kgco2e", fullFuelType, log, volume );
		} catch ( e ) {
			if ( console.trace ) console.trace();
			console.info( "Conversion to kgco2e Error: " + e.message, {
				unit,
				fullFuelType,
				graph: graph.serialize(),
			} );
			throw new Error(
				"While looking for " +
          fullFuelType +
          " " +
          unit +
          " -> kgco2e conversion:\n" +
          e.message
			);
		}

		//const DEBUG = fossilFuelType === 'coal' //&& sourceId === 2
		( DEBUG || log ) &&
      console.info( "CO2", fossilFuelType, volume.toFixed( 1 ), unit, {
      	scope1,
      	scope3,
      	methaneM3Ton,
      } );

		let volume1 = volume;
		if ( methaneM3Ton > 0 ) {
			// Calculate Scope1 for sparse project from production volume
			const e6ProductionTons = convertVolume(
				{ volume, unit, fossilFuelType },
				"e6ton"
			);
			const e6m3Methane = e6ProductionTons * methaneM3Ton;
			const e3tonMethane = convertVolume(
				{
					volume: e6m3Methane,
					unit: "e6m3",
					fossilFuelType,
				},
				"e3ton|sparse-scope1"
			);
			volume1 = e3tonMethane * 1000000;
			const toUnit = "kgco2e" + settings.fuelTypeSeparator + gwp;
			scope1 = _co2Factors( gc, "ch4kg", toUnit, "coal" );
			DEBUG &&
        console.info( "Project Specific Scope1:", {
        	scope1,
        	volume,
        	e6ProductionTons,
        	e6m3Methane,
        	methaneM3Ton,
        	e3tonMethane,
        	volume1,
        	kgco2e: volume1 * scope1.factor,
        } );
		}

		const result = {
			scope1: [
				( volume1 * ( scope1.low || 0 ) ) / 1e9,
				( volume1 * ( scope1.factor || 0 ) ) / 1e9,
				( volume1 * ( scope1.high || 0 ) ) / 1e9,
			],
			scope3: [
				( volume * scope3.low ) / 1e9,
				( volume * scope3.factor ) / 1e9,
				( volume * scope3.high ) / 1e9,
			],
		};

		if ( DEBUG || log ) {
			console.info(
				"    ",
				result.scope1[ 1 ].toFixed( 3 ),
				"+",
				result.scope3[ 1 ].toFixed( 3 ),
				"=",
				( result.scope3[ 1 ] + result.scope1[ 1 ] ).toFixed( 3 )
			);
			console.info( "" );
		}
		return result;
	};

	const calculationConstants = getCalculationConstants( {
		country: country,
		modifier: gwp ?? "GWP100",
	} );

	const co2FromVolume = (
		props: ( ProductionData | GQL_countryCurrentProductionRecord ) & {
      projectId?: number;
    }
	) => {
		if ( !props ) return { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] };
		// @ts-ignore
		const {
			volume,
			fossilFuelType,
			subtype,
			country: countryOverride,
			projectId,
		} = props;

		const fullFuelType = getFullFuelType( { fossilFuelType, subtype } );
		if ( !fullFuelType ) {
			console.error( "No fuel type found", { fossilFuelType, subtype } );
			throw new Error( "No fuel type found" );
		}

		const constantsToUse = projectId
			? getCalculationConstants( {
				projectId,
				modifier: gwp ?? "GWP100",
				country: countryOverride ?? country,
			} )
			: countryOverride
				? getCalculationConstants( {
					country: countryOverride,
					modifier: gwp ?? "GWP100",
				} )
				: calculationConstants;

		if ( !volume || !gwp ) return { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] };

		const result = calculate( { ...props, volume }, constantsToUse );

		return pipe(
			result,
			O.fromNullable,
			O.map( toVintageCO2ERepresentation ),
			O.getOrElseW( () => ( { scope1: [ 0, 0, 0 ], scope3: [ 0, 0, 0 ] } ) )
		);
	};

	const reservesProduction = (
		projection: ProjectionData[] | undefined,
		reserves: ReservesData[],
		projectionSourceId: number | undefined,
		reservesSourceId: number,
		limits: Limits | undefined,
		grades: { xp: boolean }
	) => {
		//const DEBUG = true
		DEBUG &&
      console.info( "reservesProduction", {
      	projection,
      	reserves,
      	projectionSourceId,
      	reservesSourceId,
      	limits,
      	grades,
      } );
		if ( !projectionSourceId ) return [];
		if ( !( projection && projection?.length > 1 ) ) return [];
		if ( !limits?.production ) return [];
		if ( !limits?.projection ) return [];

		// Find most recent preferred reserve

		const useGrades = getPreferredGrades( reserves, reservesSourceId );

		const _lastReserves: { [s: string]: Object } = {};
		settings.supportedFuels.forEach(
			( fuel ) =>
				( _lastReserves[ fuel ] = {
					p: { year: 0, value: 0 },
					c: { year: 0, value: 0 },
				} )
		);
		const lastReserves = _lastReserves as LastReservesType;

		for ( let i = reserves.length - 1; i >= 0; i-- ) {
			// Scan in reverse to find latest.
			const r = reserves[ i ];
			if ( r.sourceId !== reservesSourceId ) continue;
			if ( r.grade !== useGrades.pGrade && r.grade !== useGrades.cGrade )
				continue;
			const grade = r.grade[ 1 ]; // Disregard first character.
			if ( r.year < lastReserves[ r.fossilFuelType ][ grade ].year ) continue;
			DEBUG && console.info( "reservesProduction", { reserve: r } );
			lastReserves[ r.fossilFuelType ][ grade ].year = r.year;
			lastReserves[ r.fossilFuelType ][ grade ].value = sumOfCO2(
				co2FromVolume( r ),
				1
			);
		}

		const prod = [];
		// Fill out gap between production and projection (if any)
		const gapStart = Math.min(
			limits.production.oil.lastYear,
			limits.production.gas.lastYear,
			limits.production.coal.lastYear
		);
		const gapEnd = Math.max(
			limits.projection.oil.firstYear,
			limits.projection.gas.firstYear,
			limits.projection.coal.firstYear,
			gapStart
		);
		DEBUG &&
      console.info( "reservesProduction", {
      	reservesSourceId,
      	useGrades,
      	lastReserves,
      	limits,
      	gapStart,
      	gapEnd,
      } );

		if ( gapStart > 0 ) {
			for ( let y = gapStart; y < gapEnd; y++ ) {
				if ( limits.production.oil.lastYear <= y )
					prod.push( {
						...stableProduction.oil,
						year: y,
						fossilFuelType: "oil",
						sourceId: projectionSourceId,
					} );
				if ( limits.production.gas.lastYear <= y )
					prod.push( {
						...stableProduction.gas,
						year: y,
						fossilFuelType: "gas",
						sourceId: projectionSourceId,
					} );
				if ( limits.production.coal.lastYear <= y )
					prod.push( {
						...stableProduction.coal,
						year: y,
						fossilFuelType: "coal",
						sourceId: projectionSourceId,
					} );
			}
		}

		prod.forEach( ( datapoint, index ) => {
			if ( !datapoint.unit ) {
				console.info( { prod, index, datapoint } );
				throw new Error(
					`Malformed production data, no unit: ` + JSON.stringify( datapoint )
				);
			}
			return ( datapoint.co2 = co2FromVolume( datapoint ) );
		} );

		projection.forEach( ( datapoint, index ) => {
			if ( datapoint.sourceId !== projectionSourceId ) return;
			if ( datapoint.year < gapEnd ) return;
			if ( !datapoint.unit ) {
				console.info( { projection, index, datapoint } );
				throw new Error(
					`Malformed projection data, no unit: ` + JSON.stringify( datapoint )
				);
			}

			const _dp = { ...datapoint };
			_dp.co2 = co2FromVolume( datapoint );

			const pointProduction = sumOfCO2( _dp.co2, 1 );
			_dp.plannedProd = 0;
			_dp.continProd = 0;

			const fuelReserve = lastReserves[ datapoint.fossilFuelType ];

			// Subtract production from planned reserves first, then from contingent.

			if ( fuelReserve.p.value > pointProduction ) {
				_dp.plannedProd = pointProduction;
				fuelReserve.p.value -= _dp.plannedProd;
			} else if ( fuelReserve.p.value > 0 ) {
				_dp.continProd = pointProduction - fuelReserve.p.value;
				_dp.plannedProd = fuelReserve.p.value;
				fuelReserve.p.value = 0;
				if ( _dp.continProd > fuelReserve.c.value )
					_dp.continProd = fuelReserve.c.value;
				fuelReserve.c.value -= _dp.continProd;
			} else if ( fuelReserve.c.value > 0 ) {
				_dp.plannedProd = 0;
				_dp.continProd = Math.min( fuelReserve.c.value, pointProduction );
				fuelReserve.c.value -= _dp.continProd;
			}
			prod.push( _dp );
		} );

		DEBUG && console.info( { gapStart, gapEnd, prod, lastReserves } );

		return prod;
	};

	const calcCountryProductionCO2 = (
		prod: GQL_countryCurrentProductionRecord[]
	) => {
		// Find available sources
		const sourceIds = prod.reduce( ( s, p ) => {
			if ( !s.includes( p.sourceId ) ) s.push( p.sourceId );
			return s;
		}, [] as number[] );

		// Calculate total production and CO2 for all available sources.
		const sourceProd = sourceIds.map( ( sid ) => {
			const p = prod.filter( ( p ) => p.sourceId === sid );

			// Sum up all fuel subtypes
			const fuelProd = settings.supportedFuels
				.map( ( fuel ) => {
					const fp = p
						.filter( ( p ) => p.fossilFuelType === fuel )
						.reduce(
							( sumP, p1 ) => {
								if ( sumP.unit && sumP.unit !== p1.unit )
									throw new Error(
										"Multiple data points for same fuel and year cannot have different units."
									);
								sumP.unit = p1.unit;
								sumP.year = p1.year;
								sumP.volume += p1.volume || 0;
								return sumP;
							},
							{ volume: 0, unit: "", year: 0 }
						);
					return {
						...fp,
						fossilFuelType: fuel,
						sourceId: sid,
					};
				} )
				.filter( ( fp ) => fp.volume > 0 ); // Remove fuels that current sourceId doesn't have

      
       

			const fuelProduction = fuelProd.map( ( p ) => ( {
				...p,
				co2: co2FromVolume( p ),
				// TODO: Fix when there is a need of ch4 
				//co2e: calculate({ ...p }, calculationConstants ),
			} ) );
			const totalCO2 = fuelProduction.reduce(
				( acc, p ) => acc + p.co2?.scope1?.[ 1 ] + p.co2?.scope3?.[ 1 ],
				0
			);

			DEBUG && console.info( "fuelProduction", sid, fuelProduction );

			return {
				sourceId: sid,
				production: fuelProduction,
				totalCO2,
			};
		} );
		return sourceProd;
	};

	const getCountryCurrentCO2 = async ( iso3166: string | undefined | null ) => {
		if ( !iso3166 ) return null;

		try {
			const q = await apolloClient.query( {
				query: GQL_countryCurrentProduction,
				variables: { iso3166 },
			} );
			const prod = ( q.data?.getCountryCurrentProduction?.nodes ??
        [] ) as GQL_countryCurrentProductionRecord[];
			const sourceProd = calcCountryProductionCO2( prod );
			DEBUG && console.info( "Country Production", { sourceProd, prod } );
			return sourceProd;
		} catch ( e ) {
			return notificationError( [] )(
        e as Error,
        "Failed to fetch country production"
			);
		}
	};

	const projectCO2 = ( project: ProjectDataRecord ) => {
		DEBUG && console.info( { project } );
		const DEBUG = false;
		const points = project?.projectDataPoints?.nodes ?? [];
		const productionPerFuel = { totalCO2: 0, fuels: [] };

		if ( !points.length ) {
			console.info( "Warning no data point!", project );
			return productionPerFuel;
		}

		settings.supportedFuels.forEach( ( fuel ) => {
			const fuelData = points.filter(
				( p ) => p.fossilFuelType === fuel && p.dataType === "PRODUCTION"
			);
			const lastYearProd = fuelData.reduce(
				( last, point ) => {
					if ( point.year && point.year > last.year ) return point;
					else return last.year === 0 ? point : last; // for projects with year: null data.
				},
				{ year: 0 }
			);
			DEBUG && console.log( { points, fuel, fuelData, lastYearProd } );
			if ( lastYearProd.year === 0 ) return;
			const co2 = co2FromVolume( {
				...lastYearProd,
				projectId: project.id,
				methaneM3Ton: project.methaneM3Ton,
			} );
			let targetUnit;

			switch ( fuel ) {
				case "oil":
					targetUnit = "e6bbl";
					break;
				case "gas":
					targetUnit = "e6m3";
					break;
				case "coal":
					targetUnit = "e6ton";
					break;
				default:
			}

			co2.lastYear = lastYearProd.year;
			co2.dataYear = lastYearProd.dataYear;

			co2.productionVolume = convertVolume( lastYearProd, targetUnit );

			co2.scope1 = co2.scope1?.map( ( c ) => Math.round( c * 100 ) / 100 );
			co2.scope3 = co2.scope3?.map( ( c ) => Math.round( c * 100 ) / 100 );

			const sources = fuelData.reduce( ( s, p ) => {
				if ( !s.includes( p.sourceId ) ) s.push( p.sourceId );
				return s;
			}, [] );

			co2.productionString =
        co2.productionVolume?.toFixed( 1 ) +
        " " +
        getText( targetUnit ) +
        " " +
        getText( fuel );
			co2.sources = sources.map( ( id ) =>
				allSources.find( ( s ) => s.sourceId === id )
			);
			productionPerFuel[ fuel ] = co2;
			productionPerFuel.fuels.push( fuel );
			productionPerFuel.totalCO2 += co2.scope1?.[ 1 ];
			productionPerFuel.totalCO2 += co2.scope3?.[ 1 ];
		} );
		DEBUG && console.info( "CO2", productionPerFuel );
		return productionPerFuel;
	};

	return {
		sourceNameFromId,
		co2FromVolume,
		convertVolume,
		__co2FromVolume,
		reservesProduction,
		calcCountryProductionCO2,
		getCountryCurrentCO2,
		projectCO2,
		pageQuery,
		goToCountryOverview,
		conversionPathLoggerReset,
	};
};
