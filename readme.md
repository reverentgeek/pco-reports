# Planning Center Online Utilities

This command-line interface (CLI) app is a work-in-progress. It uses the Planning Center Online (PCO) [developer API](https://developer.planning.center/docs/#/overview/) to retrieve data from your PCO account. Currently the app does the following:

1. Retrieves a list of all songs in your PCO account
1. Fetches the arrangements for those songs
1. Determines which songs do not have arrangements with (chord pro) chord charts

## Setup

* Copy `.env.sample` to `.env`
* Update `.env` with your PCO [personal access token](https://api.planningcenteronline.com/oauth/applications)

## Usage

```sh
node .
```
