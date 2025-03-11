import rg from "eslint-config-reverentgeek";

export default [
	...rg.configs[ "node-esm" ],
	{
		rules: {
			"n/no-unpublished-import": [ "error", {
				allowModules: [ "eslint-config-reverentgeek" ]
			} ]
		}
	}
];

// "use strict";

// const rgConfig = require( "eslint-config-reverentgeek" );
// module.exports = [
// 	...rgConfig.configs.node,
// 	{
// 		rules: {
// 			"n/no-unpublished-require": [ "error", {
// 				allowModules: [ "eslint-config-reverentgeek" ]
// 			} ]
// 		}
// 	}
// ];
