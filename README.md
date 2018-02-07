# Monitoring Server

Rise Vision Monitoring Server

 - Runs queries for Display Monitoring and sends alerts as appropriate

## Development

Install:

```bash
npm install
```

Unit and integration tests:

```bash
npm run test
```

### Manual tests - Query

A simple query runner for the monitored displays and addresses can be run as

```bash
node test/manual/run_query.js
```

As this requires access to BigQuery using a service account,
GOOGLE_APPLICATION_CREDENTIALS environment variable should be set to the
appropriate key file before running the previous command line.

### Manual tests - Send Mail

A simple email test utility is provided as:

```bash
node test/manual/send_email.js email1@example.com email2@example.com
```
