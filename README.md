# Pipeline Coordinator Client

## Quick Notes
If the client is not running in the same container environment as the API server the following is required
* `PIPELINE_API_HOST` (hostname or ip, default pipeline-api)

Running standalone, `run.sh` will automatically load `options.sh` if present and these values can be defined there as
one possibility.

For containers, these can be defined via the -e flag, or in a Compose file, for example.
