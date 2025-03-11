export const renderChartForPlanningCenter = ( song ) => {
	const chart = [];
	const MAX_LINES_PER_PAGE = 50;
	const HEADER_LINES = 3;
	let pageLineCount = 0;

	song.sections.forEach( section => {
		// console.log( section );
		const nextPageLineCount = pageLineCount + ( section.lines.length * 2 ) + HEADER_LINES;
		if ( nextPageLineCount > MAX_LINES_PER_PAGE ) {
			chart.push( "PAGE_BREAK" );
			pageLineCount = 0;
		} else {
			pageLineCount = nextPageLineCount;
		}
		chart.push( "" );
		chart.push( section.name.toUpperCase() );
		chart.push( "" );
		section.lines.forEach( line=> {
			chart.push( line );
		} );
	} );

	return chart.join( "\n" );
};
