export function parseLyricLine( lyricLine ) {
	const chunks = lyricLine.split( /(\[[^\]]*\]\s+|\[[^\]]*\][\w][^[()]+|\([^)]*\))/ ).filter( t => t !== "" );
	const chords = [];
	const lyrics = [];
	const directions = [];
	for( let i = 0; i < chunks.length; i++ ) {
		chunks[i] = chunks[i].replace( "\r", "" );
		if ( chunks[i].indexOf( "[" ) > -1 ) {
			const subchunks = chunks[i].split( /(\[[^\]]*\])/ ).filter( t => t !== "" );
			chords.push( subchunks[0].replace( "[", "" ).replace( "]", "" ) );
			lyrics.push( subchunks.length === 2 ? subchunks[ 1 ] : "" );
			directions.push( "" );
		}
		else if ( chunks[i].startsWith( "(" ) ) {
			chords.push( "" );
			lyrics.push( "" );
			directions.push( chunks[i] );
		} else {
			chords.push( "" );
			lyrics.push( chunks[i] );
			directions.push( "" );
		}
	}
	return { chords, lyrics, directions };
}

export function parseSection( line ) {
	const text = line.replace( "{", "" ).replace( "}", "" );
	const parts = text.split( ":" );
	return parts.length > 1 ? { type: parts[0].toLowerCase().trim(), text: parts.slice( 1 ).join( ":" ).trim() } : { type: parts[0].trim(), text: parts[0].trim() };
}

function isTitle( sectionType ) {
	return sectionType === "title";
}

function isSubtitle( sectionType ) {
	return sectionType === "subtitle";
}

function isArtist( sectionType ) {
	return sectionType === "artist" || sectionType === "composer" || sectionType === "lyricist";
}

function isKey( sectionType ) {
	return sectionType === "key";
}

function isTime( sectionType ) {
	return sectionType === "time";
}

function isTempo( sectionType ) {
	return sectionType === "tempo";
}

function isIgnoredSection( sectionType ) {
	return sectionType === "end_of_chorus" || sectionType === "end_of_verse" || sectionType === "end_of_bridge";
}

function isComment( sectionType ) {
	return sectionType.startsWith( "comment" );
}

function isFooter( sectionType ) {
	return sectionType === "footer";
}

export function parse( chordProText ) {
	const lines = chordProText.split( "\n" );
	const parsed = {
		title: "",
		subtitle: "",
		artist: [],
		key: "",
		tempo: "",
		time: "",
		sections: [],
		footer: []
	};
	let sectionIndex = -1;
	for( let i = 0; i < lines.length; i++ ) {
		if ( lines[i].trim().startsWith( "{" ) ) {
			const section = parseSection( lines[i] );
			switch( true ) {
				case isTitle( section.type ):
					parsed.title = section.text;
					break;
				case isSubtitle( section.type ):
					parsed.subtitle = section.text;
					break;
				case isArtist( section.type ):
					parsed.artist.push( section.text );
					break;
				case isKey( section.type ):
					parsed.key = section.text;
					break;
				case isTime( section.type ):
					parsed.time = section.text;
					break;
				case isTempo( section.type ):
					parsed.tempo = section.text;
					break;
				case isFooter( section.type ):
					parsed.footer.push( section.text );
					break;
				case isIgnoredSection( section.type ):
					break;
				case isComment( section.type ):
					sectionIndex++;
					parsed.sections.push( {
						name: section.text,
						lines: []
					} );
					break;
				default:
					parsed[section.type] = section.text;
					break;
			}
		} else if ( lines[i].trim().length > 0 ) {
			if ( lines[i].trim().startsWith( "CCLI" ) ) {
				while( i < lines.length ) {
					if ( lines[i].trim().length > 0 ) {
						parsed.footer.push( lines[i].trim() );
					}
					i++;
				}
				return parsed;
			}
			parsed.sections[sectionIndex].lines.push( lines[i] );
		}
	}
	return parsed;
}
