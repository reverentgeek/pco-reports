import fs from "fs-extra";
import path from "path";
import { parse } from "./chordpro.js";
import { renderChartForPlanningCenter } from "./pco.js";

const __dirname = import.meta.dirname;

async function convertChordProToPCO( basePath ) {
	const chartsFolder = path.join( basePath, "chordpro" );
	const pcoFolder = path.join( basePath, "pco" );

	console.log( "rendering chordpro charts to pco" );
	console.log( `reading in chart files [${ chartsFolder }]...` );
	const chartFiles = await fs.readdir( chartsFolder );
	for( const file of chartFiles ) {
		console.log( `parsing chart file [${ file }]...` );
		const chart = await fs.readFile( path.join( chartsFolder, file ), "utf-8" );
		const parsedChart = parse( chart );
		// console.log( parsedChart );
		console.log( "converting chordpro chart to pco..." );
		const pco = renderChartForPlanningCenter( parsedChart );

		const pcoFile = path.join( pcoFolder, `${ path.basename( file, path.extname( file ) ) }.txt` );
		console.log( `writing pco file [${ pcoFile }]` );
		await fs.writeFile( pcoFile, pco, "utf8" );
	}
};

async function main() {
	const basePath = path.join( __dirname, "..", "data" );
	// console.log( basePath );
	await convertChordProToPCO( basePath );
}

main().catch( err => {
	console.error( err );
	process.exit( 1 );
} );
