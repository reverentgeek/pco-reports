"use strict";

const axios = require( "axios" ).default;
const fs = require( "fs-extra" );
const dotenv = require( "dotenv" );
const progress = require( "cli-progress" );

dotenv.config();

const { PCO_APP_ID: appId, PCO_APP_SECRET: secret } = process.env;
const client = axios.create( {
	baseURL: "https://api.planningcenteronline.com/",
	auth: {
		username: appId,
		password: secret
	}
} );

async function getSongs() {
	const exists = await fs.pathExists( "./songs.json" );
	if ( !exists ) {
		const bar = new progress.SingleBar( {}, progress.Presets.shades_classic );
		let songs = [];
		let total = 1000;
		let offset = 0;
		let firstFetch = true;
		const pageSize = 100;

		console.log( "fetching songs from API..." );
		while ( offset < total ) {
			const res = await client.get( `services/v2/songs?offset=${ offset }&per_page=${ pageSize }` );
			if ( firstFetch ) {
				total = res.data.meta.total_count;
				offset = res.data.meta.next ? res.data.meta.next.offset : total;
				bar.start( total, offset );
				firstFetch = false;
			} else {
				offset = res.data.meta.next ? res.data.meta.next.offset : total;
				bar.update( offset );
			}
			// console.log( `fetched ${ offset }` );
			songs = songs.concat( res.data.data );
		}
		bar.stop();
		await fs.writeJson( "./songs.json", songs, { spaces: 2 } );
		return songs;
	}
	console.log( "reading songs from songs.json" );
	return await fs.readJson( "./songs.json" );
}

async function getArrangementsById( songId ) {
	const res = await client.get( `/services/v2/songs/${ songId }/arrangements` );
	return res.data.data;
}

async function getArrangements() {
	const songArrangements = [];
	const exists = await fs.pathExists( "./songArrangements.json" );
	if ( !exists ) {
		const songs = await getSongs();
		console.log( "fetching arrangements from API..." );
		const bar = new progress.SingleBar( {}, progress.Presets.shades_classic );
		bar.start( songs.length, 0 );
		for ( const song of songs ) {
			const arrangements = await getArrangementsById( song.id );
			songArrangements.push( {
				id: song.id,
				title: song.attributes.title,
				author: song.attributes.author,
				ccli_number: song.attributes.ccli_number,
				created_at: song.attributes.created_at,
				updated_at: song.attributes.updated_at,
				last_scheduled_at: song.attributes.last_scheduled_at,
				arrangements
			} );
			bar.increment();
		}
		bar.stop();
		await fs.writeJson( "./songArrangements.json", songArrangements, { spaces: 2 } );
		return songArrangements;
	}
	console.log( "reading song arrangements from songArrangements.json" );
	return await fs.readJson( "./songArrangements.json" );
}

async function getSongsWithoutCharts() {
	const exists = await fs.pathExists( "./songsWithoutCharts.json" );
	if ( !exists ) {
		const songs = await getArrangements();
		let songsWithCharts = [];
		let songsWithoutCharts = [];
		for( const song of songs ) {
			let hasChart = false;
			try {
				for ( const arrangement of song.arrangements ) {
					if ( arrangement.attributes.has_chords ) {
						hasChart = true;
					}
				}
				hasChart ? songsWithCharts.push( song ) : songsWithoutCharts.push( song );
			} catch( err ) {
				console.log( err );
				console.log( song );
				break;
			}
		}
		await fs.writeJson( "./songsWithoutCharts.json", songsWithoutCharts, { spaces: 2 } );
		await fs.writeJson( "./songsWithCharts.json", songsWithCharts, { spaces: 2 } );
		console.log( `songs with charts:    ${ songsWithCharts.length }` );
		console.log( `songs without charts: ${ songsWithoutCharts.length }` );
		return songsWithoutCharts;
	}
	return await fs.readJson( "./songsWithoutCharts.json" );
}

async function main() {
	const songs = await getSongsWithoutCharts();
	const songReport = [];
	songReport.push( [ "ID", "Title", "Author", "CCLI", "Created At", "Updated At", "Last Scheduled" ].join( "\t" ) );
	for( const song of songs ) {
		const parts = [ song.id, song.title, song.author, song.ccli_number,
			new Date( song.created_at ).toLocaleDateString(),
			new Date( song.updated_at ).toLocaleDateString(),
			song.last_scheduled_at ? new Date( song.last_scheduled_at ).toLocaleDateString() : "" ];
		songReport.push( parts.join( "\t" ) );
	}
	await fs.writeFile( "./songsWithoutCharts.tab", songReport.join( "\n" ) );
}

main().then( () => console.log( "finished" ) );
