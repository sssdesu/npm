# cute-dynamo

A minimalistic DynamoDB client library with a cute API design for Node.js applications.

## Features

- 🎯 Simple and intuitive API
- 🔐 Supports both client-side (Cognito Identity Pool) and server-side (Access Key) authentication
- 📦 Lightweight with minimal dependencies
- 🚀 Built on AWS SDK v3
- 💡 Environment variable support for easy configuration

## Installation

```bash
npm install cute-dynamo
```

## Quick Start

### Initialize the client

```javascript
import { init, table } from 'cute-dynamo';

// Server-side authentication (reads from environment variables)
await init();

// Or provide credentials explicitly
await init({
  region: 'us-east-1',
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_KEY'
});

// Client-side authentication with Cognito Identity Pool
await init({
  region: 'us-east-1',
  identityPoolId: 'us-east-1:your-identity-pool-id'
});
```

### Environment Variables

The library can automatically read from these environment variables:

- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key ID (for server-side)
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key (for server-side)
- `AWS_IDENTITY_POOL_ID` - Cognito Identity Pool ID (for client-side)
- `DYNAMODB_TABLE` - Default table name

### Basic Operations

```javascript
// Get an item
const item = await table('your-table-name')
  .at({ pk: 'user123', sk: 'profile' })
  .get();

// Put an item
await table('your-table-name')
  .at({ pk: 'user123', sk: 'profile' })
  .put({ name: 'John Doe', email: 'john@example.com' });

// Using environment variable for table name
await table() // Uses DYNAMODB_TABLE env var
  .at({ pk: 'user123', sk: 'profile' })
  .get();
```

## API Reference

### `init(options)`

Initializes the DynamoDB client.

**Parameters:**
- `options.region` - AWS region (default: `process.env.AWS_REGION`)
- `options.accessKeyId` - AWS access key ID (default: `process.env.AWS_ACCESS_KEY_ID`)
- `options.secretAccessKey` - AWS secret access key (default: `process.env.AWS_SECRET_ACCESS_KEY`)
- `options.identityPoolId` - Cognito Identity Pool ID (default: `process.env.AWS_IDENTITY_POOL_ID`)

### `table(tableName)`

Creates a table instance for operations.

**Parameters:**
- `tableName` - Name of the DynamoDB table (default: `process.env.DYNAMODB_TABLE`)

**Returns:** Table instance with `at()` method

### Table Methods

#### `.at(key).get()`
Retrieves an item from the table.

#### `.at(key).put(data)`
Stores an item in the table.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.