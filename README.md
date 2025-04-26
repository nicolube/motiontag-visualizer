# motiontag-visualizer

## Visualizer

This little application visualizes the csv file you receive, when you request your personal information of [Motion-Tag](https://motiontag.com/).
It currently visualizes the paths you tracked in a simple map view.

All data handling happens in your browser. Therefore you can also use the deployed version at github pages.

### Development

This project uses [pnpm](https://pnpm.io/) as a package manager.
Use `pnpm serve` to start a local server with auto-refresh.

## Downloader

A CLI program in Rust, to download your data directly from Motion-Tags API. The API was reverse-engineered from looking at their [public API specification](https://api.motion-tag.de/developer/backend) and their app.

I don't know whether they tolerate usage of their API by third-party apps, so use this at your own risk.

The format of the exported data follows the DSGVO data export format and is therefore compatible with the visualizer.

### Usage

```sh
# cd ./downloader

# You can authenticate by using username and password OR using a token

# Authenticate in with user and password
cargo run -- -u "your_user@example.com" -p "<password>"

# Authenticate by reusing token
cargo run -- -t "eyJhbGciOiJIUzI1NiJ9...."

# Additionally to the authentication, you can use following flags:

# Specify range (without, the CLI will try to download all days)
cargo run -- [...] --from "2024-05-02" --to "2024-12-31"

# Specify output file (without, default is './motiontag_export.csv')
cargo run -- [...] -o "./export-2025.csv"

# Overwrite API base-URL (untested, but possible 😄)
cargo run -- [...] --url "https://api.motion-tag.de/api"
```

## TODO / Future Ideas / Roadmap / ...
- ~~support more than one year in DailyDistanceHeatMap~~
- add more statistics
- use [pfaedle](https://github.com/ad-freiburg/pfaedle) to align public transport rides with correct paths
- compare paths and find commute routes
