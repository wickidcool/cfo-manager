# DynamoDB Export/Import Tool

A comprehensive CLI tool for exporting and importing DynamoDB table data to/from JSON files with support for pagination, filtering, grouping, and progress reporting.

## Features

### Export

- ✅ **Full Table Export**: Export all items from any DynamoDB table
- 📊 **Grouped Export**: Automatically group items by entity type
- 🔍 **Filtering**: Support for DynamoDB filter expressions
- 📈 **Progress Reporting**: Real-time progress updates during export
- 💾 **Flexible Output**: Pretty-printed JSON with optional metadata
- ⚡ **Pagination**: Automatic handling of large tables
- 🎯 **Smart Entity Detection**: Automatically detect and group by entity types

### Import

- 📥 **Full Table Import**: Import JSON files back to DynamoDB
- 🔄 **Smart Format Detection**: Auto-detects export format (standard/grouped)
- 🛡️ **Safety Features**: Dry-run mode and optional overwrite protection
- ⚡ **Batch Processing**: Efficient batch writes (25 items per batch)
- 📊 **Progress Tracking**: Real-time import progress
- 🎯 **Flexible Input**: Supports various JSON formats

## Installation

No additional installation required. The tool uses existing project dependencies.

## CLI Usage

### Basic Commands

```bash
# Export table
npm run db-export export -t my-table -o backup.json

# Import data
npm run db-export import -t my-table -f backup.json

# Get item count
npm run db-export count -t my-table

# Show help
npm run db-export help
```

### Export Commands

#### Basic Export

```bash
npm run db:export
# or
npm run db-export export -t my-table
```

#### Grouped Export (by entity type)

```bash
npm run db:export:grouped
# or
npm run db-export export -t my-table --grouped
```

#### Export with Filter

```bash
npm run db-export export -t my-table --filter "attribute_exists(email)"
```

#### Export to Custom Location

```bash
npm run db-export export -t my-table -o backup.json -d ./backups
```

#### Compact Export (no pretty-print)

```bash
npm run db-export export -t my-table --compact
```

#### Export without Metadata

```bash
npm run db-export export -t my-table --no-metadata
```

### Import Commands

#### Basic Import

```bash
npm run db:import -- -t my-table -f backup.json
```

#### Dry Run (preview without writing)

```bash
npm run db-export import -t my-table -f backup.json --dry-run
```

#### Import without Overwriting

```bash
npm run db-export import -t my-table -f backup.json --no-overwrite
```

### Count Command

```bash
npm run db:count -- -t my-table
# or
npm run db-export count -t my-table
```

### Legacy Usage (Environment Variables)

These still work for backward compatibility:

```bash
# Basic export
TABLE_NAME=my-table npm run db:export

# Grouped export
TABLE_NAME=my-table npm run db:export:grouped

# With output file
TABLE_NAME=my-table OUTPUT_FILE=backup.json npm run db:export

# With filter
TABLE_NAME=my-table FILTER_EXPRESSION="attribute_exists(email)" npm run db:export

# Different region
AWS_REGION=us-west-2 TABLE_NAME=my-table npm run db:export
```

## CLI Options Reference

### Export Options

| Flag                    | Description          | Default               |
| ----------------------- | -------------------- | --------------------- |
| `-t, --table <name>`    | Table name           | From `TABLE_NAME` env |
| `-o, --output <file>`   | Output filename      | Auto-generated        |
| `-d, --dir <directory>` | Output directory     | Current directory     |
| `-r, --region <region>` | AWS region           | From `AWS_REGION` env |
| `-g, --grouped`         | Group by entity type | `false`               |
| `--filter <expression>` | Filter expression    | None                  |
| `--compact`             | Compact JSON output  | `false`               |
| `--no-metadata`         | Exclude metadata     | `false`               |

### Import Options

| Flag                    | Description             | Default               |
| ----------------------- | ----------------------- | --------------------- |
| `-t, --table <name>`    | Target table name       | **Required**          |
| `-f, --file <path>`     | Input JSON file         | **Required**          |
| `-r, --region <region>` | AWS region              | From `AWS_REGION` env |
| `--dry-run`             | Preview without writing | `false`               |
| `--no-overwrite`        | Skip existing items     | `false` (overwrites)  |

### Count Options

| Flag                    | Description | Default               |
| ----------------------- | ----------- | --------------------- |
| `-t, --table <name>`    | Table name  | **Required**          |
| `-r, --region <region>` | AWS region  | From `AWS_REGION` env |

## Environment Variables

| Variable            | Description          | Default                                   | Commands |
| ------------------- | -------------------- | ----------------------------------------- | -------- |
| `TABLE_NAME`        | DynamoDB table name  | `construction-app-dev-construction-table` | All      |
| `OLD_TABLE_NAME`    | Fallback table name  | None                                      | All      |
| `AWS_REGION`        | AWS region           | `us-east-2`                               | All      |
| `OUTPUT_FILE`       | Output filename      | Auto-generated                            | Export   |
| `OUTPUT_DIR`        | Output directory     | Current directory                         | Export   |
| `GROUP_BY_TYPE`     | Group by entity type | `false`                                   | Export   |
| `FILTER_EXPRESSION` | Filter expression    | None                                      | Export   |

## Output Format

### Standard Export

```json
{
  "metadata": {
    "tableName": "construction-app-dev-construction-table",
    "exportedAt": "2024-11-20T18:30:00.000Z",
    "itemCount": 1234,
    "scannedCount": 1234,
    "region": "us-east-2",
    "filterExpression": null
  },
  "items": [
    {
      "PK": "USER#123",
      "SK": "PROFILE",
      "email": "user@example.com"
      // ... other attributes
    }
    // ... more items
  ]
}
```

### Grouped Export

```json
{
  "metadata": {
    "tableName": "construction-app-dev-construction-table",
    "exportedAt": "2024-11-20T18:30:00.000Z",
    "totalItems": 1234,
    "entityTypes": 5,
    "region": "us-east-2"
  },
  "itemsByType": {
    "USER": [{ "PK": "USER#123", "SK": "PROFILE", "email": "user@example.com" }],
    "ORG": [{ "PK": "ORG#456", "SK": "METADATA", "name": "ACME Corp" }],
    "PROJECT": [{ "PK": "PROJECT#789", "SK": "METADATA", "name": "Building A" }]
  }
}
```

## Programmatic Usage

You can also use the exporter programmatically in your code:

```typescript
import DynamoDBExporter from "./src/tools/db-export";

async function exportData() {
  const exporter = new DynamoDBExporter({
    tableName: "my-table",
    region: "us-east-2",
    outputFile: "export.json",
    pretty: true,
    includeMetadata: true,
  });

  try {
    const filePath = await exporter.export();
    console.log(`Export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}
```

### Export with Filtering

```typescript
const exporter = new DynamoDBExporter({
  tableName: "my-table",
  filterExpression: "attribute_exists(email) AND #status = :active",
  expressionAttributeNames: {
    "#status": "status",
  },
  expressionAttributeValues: {
    ":active": "active",
  },
});

await exporter.export();
```

### Grouped Export

```typescript
const exporter = new DynamoDBExporter({
  tableName: "my-table",
});

await exporter.exportByEntityType();
```

### Get Item Count (Without Full Export)

```typescript
const exporter = new DynamoDBExporter({
  tableName: "my-table",
});

const count = await exporter.getItemCount();
console.log(`Table has ${count} items`);
```

## Examples

### Export Examples

#### Example 1: Daily Backup

```bash
# Export production table to dated backup file
npm run db-export export \
  -t construction-app-prod-construction-table \
  -o "prod-backup-$(date +%Y%m%d).json" \
  -d ./backups
```

#### Example 2: Export Filtered Data

```bash
# Export only active users
npm run db-export export \
  -t users-table \
  --filter "attribute_exists(email) AND #status = :active"
```

#### Example 3: Grouped Export for Analysis

```bash
# Export grouped by entity type
npm run db-export export \
  -t construction-app-dev-construction-table \
  --grouped
```

#### Example 4: Quick Item Count

```bash
# Get count without full export
npm run db-export count -t my-table
```

### Import Examples

#### Example 1: Basic Import

```bash
# Import from backup file
npm run db-export import \
  -t construction-app-dev-construction-table \
  -f ./backups/backup-20241120.json
```

#### Example 2: Dry Run First

```bash
# Preview import before executing
npm run db-export import \
  -t my-table \
  -f backup.json \
  --dry-run

# If preview looks good, run for real
npm run db-export import \
  -t my-table \
  -f backup.json
```

#### Example 3: Import Without Overwriting

```bash
# Only import new items, skip existing ones
npm run db-export import \
  -t my-table \
  -f backup.json \
  --no-overwrite
```

#### Example 4: Cross-Region Migration

```bash
# Export from one region
npm run db-export export \
  -t my-table \
  -r us-east-1 \
  -o export.json

# Import to another region
npm run db-export import \
  -t my-table \
  -r us-west-2 \
  -f export.json
```

#### Example 5: Table Clone

```bash
# Export from source table
npm run db-export export \
  -t source-table \
  -o clone-data.json

# Import to target table
npm run db-export import \
  -t target-table \
  -f clone-data.json
```

### Programmatic Examples

#### Example: Custom Export with Processing

```typescript
import DynamoDBExporter from "./src/tools/db-export";

const exporter = new DynamoDBExporter({
  tableName: "my-table",
  region: "us-east-2",
});

// Get count first
const count = await exporter.getItemCount();
console.log(`Table contains ${count} items`);

// Export if reasonable size
if (count < 100000) {
  await exporter.export();
}

await exporter.close();
```

#### Example: Batch Import with Validation

```typescript
import DynamoDBExporter from "./src/tools/db-export";

const exporter = new DynamoDBExporter({
  tableName: "target-table",
});

try {
  // Dry run first
  await exporter.import("data.json", { dryRun: true });

  // Actual import
  const result = await exporter.import("data.json", {
    overwrite: false,
    batchSize: 25,
  });

  console.log(`Imported: ${result.imported}, Failed: ${result.failed}`);
} finally {
  await exporter.close();
}
```

## Performance

- **Pagination**: Automatically handles tables of any size
- **Memory Efficient**: Streams data in batches
- **Progress Tracking**: Real-time updates on scan progress
- **Scan Rate**: Depends on table size and provisioned throughput
  - Small tables (< 10K items): ~5-10 seconds
  - Medium tables (10K-100K items): ~30-60 seconds
  - Large tables (> 100K items): Several minutes

## Console Output

### Export Output

```
📦 DynamoDB Export Tool
════════════════════════════════════════════════════════════
Table: construction-app-dev-construction-table
Region: us-east-2
Output: /path/to/export-2024-11-20T18-30-00.json
════════════════════════════════════════════════════════════

📄 Scanning batch 1...
   ✓ Found 1000 items (1000 total)
   → More items to scan...

📄 Scanning batch 2...
   ✓ Found 234 items (1234 total)

✅ Scan complete!
   Items exported: 1234
   Items scanned: 1234
   Duration: 3.45s
   Batches: 2

💾 File saved!
   Path: /path/to/export-2024-11-20T18-30-00.json
   Size: 2.34 MB

✨ Export completed successfully!
```

### Import Output

```
📥 DynamoDB Import Tool
════════════════════════════════════════════════════════════
Source: /path/to/backup.json
Table: construction-app-dev-construction-table
Region: us-east-2
Mode: LIVE
Overwrite: Yes
════════════════════════════════════════════════════════════

📖 Reading file...
   Found metadata: exported 1234 items on 2024-11-20T18:30:00.000Z
   ✓ Found 1234 items to import

📦 Processing batch 1/50 (25 items)...
   ✓ Imported 25 items

📦 Processing batch 2/50 (25 items)...
   ✓ Imported 25 items

...

✅ Import complete!
   Items imported: 1234
   Items failed: 0
   Duration: 5.67s
   Throughput: 217 items/sec

✨ Import completed successfully!

Summary:
  Imported: 1234
  Failed: 0
  Skipped: 0
```

### Dry Run Output

```
📥 DynamoDB Import Tool
════════════════════════════════════════════════════════════
Source: /path/to/backup.json
Table: construction-app-dev-construction-table
Region: us-east-2
Mode: DRY RUN
Overwrite: Yes
════════════════════════════════════════════════════════════

📖 Reading file...
   ✓ Found 1234 items to import

🔍 DRY RUN MODE - No items will be written

Would import 1234 items
Batches required: 50

📋 Sample item (first):
{
  "PK": "USER#123",
  "SK": "PROFILE",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

## Troubleshooting

### Export Issues

#### Error: Table Not Found

Make sure the table name is correct and you have access:

```bash
# List available tables
aws dynamodb list-tables --region us-east-2
```

#### Error: Access Denied (Export)

Ensure your AWS credentials have `dynamodb:Scan` permission:

```json
{
  "Effect": "Allow",
  "Action": ["dynamodb:Scan", "dynamodb:DescribeTable"],
  "Resource": "arn:aws:dynamodb:*:*:table/*"
}
```

#### Large Files

For very large tables, consider:

- Using filter expressions to export subsets
- Exporting to multiple files grouped by entity type
- Compressing the output file after export

#### Timeout Errors

If scans timeout, the tool will retry automatically. For very large tables, you may need to:

- Increase your IAM role timeout
- Run the export during off-peak hours
- Use pagination with smaller batch sizes

### Import Issues

#### Error: File Not Found

Ensure the file path is correct:

```bash
# Use absolute path
npm run db-export import -t my-table -f /full/path/to/backup.json

# Or relative path from current directory
npm run db-export import -t my-table -f ./backups/backup.json
```

#### Error: Invalid JSON Format

The tool accepts:

- Simple arrays: `[{...}, {...}]`
- Export format: `{ "metadata": {...}, "items": [...] }`
- Grouped format: `{ "metadata": {...}, "itemsByType": {...} }`

Validate your JSON:

```bash
# Check JSON syntax
cat backup.json | jq . > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

#### Error: Access Denied (Import)

Ensure your AWS credentials have write permissions:

```json
{
  "Effect": "Allow",
  "Action": ["dynamodb:PutItem", "dynamodb:BatchWriteItem"],
  "Resource": "arn:aws:dynamodb:*:*:table/*"
}
```

#### Throttling Errors

If you encounter throttling:

- The tool automatically adds 100ms delay between batches
- Run imports during off-peak hours
- Increase your table's provisioned write capacity
- Use on-demand billing mode

#### Partial Import Failures

If some items fail:

- Check the console output for specific errors
- The tool continues processing remaining items
- Re-run with `--no-overwrite` to import only failed items
- Check CloudWatch Logs for detailed error messages

#### Data Validation Errors

If items fail with validation errors:

- Use `--dry-run` to preview items before importing
- Check for missing required attributes
- Verify data types match table schema
- Check for items exceeding 400KB limit

### General Issues

#### Permission Denied Errors

Ensure your AWS credentials are configured:

```bash
# Check credentials
aws sts get-caller-identity

# Configure if needed
aws configure
```

#### Region Mismatch

Ensure you're using the correct region:

```bash
# Specify region explicitly
npm run db-export export -t my-table -r us-east-2

# Or set environment variable
export AWS_REGION=us-east-2
```

## Advanced Options

### Custom Export Logic

Create a custom exporter class:

```typescript
import DynamoDBExporter from "./src/tools/db-export";

class CustomExporter extends DynamoDBExporter {
  // Override entity type detection
  protected extractEntityType(item: any): string {
    // Custom logic here
    return item.customType || "UNKNOWN";
  }
}
```

## Best Practices

1. **Regular Backups**: Schedule regular exports for backup purposes
2. **Version Control**: Include export timestamp in filename
3. **Compress Large Exports**: Use `gzip` for large files
4. **Validate Exports**: Check item count matches expected values
5. **Secure Storage**: Store exports in secure, encrypted locations
6. **Test Restores**: Regularly test restore procedures

## Related Tools

- `db-refactor`: Tool for database migrations and schema changes
- `create-dynamodb-table.sh`: Script for creating new DynamoDB tables

## Support

For issues or questions, please contact the development team or create an issue in the repository.
