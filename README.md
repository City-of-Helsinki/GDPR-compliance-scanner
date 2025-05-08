# GDPR Compliance Scanner

A tool for scanning websites to check cookie GDPR-compliance and generate detailed reports.

## Scanning requirements

The website should use HDS Cookie Banner

## Features

* Scans multiple URLs with different cookie consent configurations
* Detects cookies, localStorage, sessionStorage, indexedDB, and cacheStorage items
* Checks compliance against HDS cookie banner site settings
* Generates interactive HTML reports with charts and sortable tables

## Installation

```bash
make install
```

## Configuration

Configure scanning parameters in config/site-name-config.js. Key settings include:

* `name`: Name of the site, use small letters and no spaces. This will be used for report file and folder names.
* `mainUrl`: Main website URL to scan
* `apiUrl`: API endpoint for cookie banner settings
* `settingsDomainSubstitution`: Domain substitution for testing
* `urls`: Array of URL configurations to scan

Example URL configuration:

```JS
{
  nameBase: 'Frontpage',
  url: 'https://www.hel.fi/fi/',
  actions: [],
  variants: [
    'none',
    'required',
    'all'
  ],
  headless: true,
  pause: false
}
```

### Adding a new configuration file

You can add any site that has hds cookie banner in use under the config folder. Name the file as ```site-name-config.js``` and add relevant configurations to the file.

## Usage

1. Start the service:
```bash
make up
```

2. Start the scanner:

```bash
make run
```

3. View reports by opening [https://helfi-gdpr-scanner.docker.so/](https://helfi-gdpr-scanner.docker.so/) in your browser

## Report features

The generated reports include:

* Compliance overview with donut chart
* Detailed inventory of scanned URLs and frames
* List of found items (cookies, storage, etc.) with compliance status
* Domains visited by browser when opening inventory pages and their frames
* Site settings and rules used for compliance checking
* Sortable tables for easy data analysis

## Project structure

* `/config` - Configuration files
* `/reports` - Generated HTML reports and assets
  * `/json` - Folder for all json reports
    * `/site_name` - Report data in JSON format
  * `/logs` - Error logs of scans
* `/src` - Source code
  * `/collectors` - Data collection modules
  * `/compliance` - Compliance checking logic
  * `/reporter` - Report generation
  * `/server` - Local report server
  * `/utils` - Utility functions

## Report Interface

The report interface uses:

* Chart.js for data visualization
* Mustache.js for templating
* CSS Grid and Flexbox for layout
* Responsive design with dark mode support

Key UI components referenced from:

## Licence

[MIT License](LICENCE)

---

This tool is designed for web developers and compliance teams to audit cookie and storage usage across websites. For more detailed technical documentation, please check the source code comments.
