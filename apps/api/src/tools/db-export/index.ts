#!/usr/bin/env node

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandOutput,
  BatchWriteCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import * as fs from "fs";
import * as path from "path";

/**
 * DynamoDB Table Export Tool
 *
 * Exports all items from a DynamoDB table to a JSON file.
 * Supports pagination, filtering, and progress reporting.
 *
 * Usage:
 *   npm run db:export
 *   TABLE_NAME=my-table npm run db:export
 *   TABLE_NAME=my-table OUTPUT_FILE=output.json npm run db:export
 */

interface ExportOptions {
  tableName: string;
  region?: string;
  outputFile?: string;
  outputDir?: string;
  filterExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, any>;
  limit?: number;
  pretty?: boolean;
  includeMetadata?: boolean;
}

interface ExportMetadata {
  tableName: string;
  exportedAt: string;
  itemCount: number;
  scannedCount: number;
  consumedCapacity?: number;
  region: string;
  filterExpression?: string;
}

interface ExportResult {
  metadata: ExportMetadata;
  items: any[];
}

export class DynamoDBExporter {
  private dynamoClient: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private options: ExportOptions;

  constructor(options: ExportOptions) {
    this.options = {
      region: options.region || process.env['AWS_REGION'] || "us-east-2",
      outputDir: options.outputDir || process.cwd(),
      pretty: options.pretty !== false, // Default to pretty-print
      includeMetadata: options.includeMetadata !== false, // Default to include metadata
      ...options,
    };

    this.dynamoClient = new DynamoDBClient({
      region: this.options.region,
    });

    this.docClient = DynamoDBDocumentClient.from(this.dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });
  }

  /**
   * Export table data to JSON file
   */
  async export(): Promise<string> {
    console.log(`\n📦 DynamoDB Export Tool`);
    console.log(`${"═".repeat(60)}`);
    console.log(`Table: ${this.options.tableName}`);
    console.log(`Region: ${this.options.region}`);
    console.log(`Output: ${this.getOutputFilePath()}`);
    if (this.options.filterExpression) {
      console.log(`Filter: ${this.options.filterExpression}`);
    }
    console.log(`${"═".repeat(60)}\n`);

    const startTime = Date.now();
    const items: any[] = [];
    let scannedCount = 0;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;
    let scanCount = 0;

    try {
      do {
        scanCount++;
        console.log(`📄 Scanning batch ${scanCount}...`);

        const command: ScanCommand = new ScanCommand({
          TableName: this.options.tableName,
          ExclusiveStartKey: lastEvaluatedKey,
          Limit: this.options.limit,
          FilterExpression: this.options.filterExpression,
          ExpressionAttributeNames: this.options.expressionAttributeNames,
          ExpressionAttributeValues: this.options.expressionAttributeValues,
        });

        const response: ScanCommandOutput = await this.docClient.send(command);

        const batchItems = response.Items || [];
        items.push(...batchItems);
        scannedCount += response.ScannedCount || 0;

        console.log(
          `   ✓ Found ${batchItems.length} items (${items.length} total)`,
        );

        lastEvaluatedKey = response.LastEvaluatedKey;

        // Show progress
        if (lastEvaluatedKey) {
          console.log(`   → More items to scan...`);
        }
      } while (lastEvaluatedKey);

      const duration = Date.now() - startTime;

      console.log(`\n✅ Scan complete!`);
      console.log(`   Items exported: ${items.length}`);
      console.log(`   Items scanned: ${scannedCount}`);
      console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
      console.log(`   Batches: ${scanCount}`);

      // Prepare export data
      const exportData: ExportResult = {
        metadata: {
          tableName: this.options.tableName,
          exportedAt: new Date().toISOString(),
          itemCount: items.length,
          scannedCount,
          region: this.options.region!,
          filterExpression: this.options.filterExpression,
        },
        items,
      };

      // Write to file
      const outputPath = this.getOutputFilePath();
      const outputContent = this.options.includeMetadata ? exportData : items;

      const jsonString = this.options.pretty
        ? JSON.stringify(outputContent, null, 2)
        : JSON.stringify(outputContent);

      fs.writeFileSync(outputPath, jsonString, "utf-8");

      const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(
        2,
      );

      console.log(`\n💾 File saved!`);
      console.log(`   Path: ${outputPath}`);
      console.log(`   Size: ${fileSizeMB} MB`);

      return outputPath;
    } catch (error) {
      console.error(`\n❌ Export failed:`, error);
      throw error;
    }
  }

  /**
   * Export and group items by entity type (based on PK prefix)
   */
  async exportByEntityType(): Promise<string> {
    console.log(`\n📦 DynamoDB Export Tool (Grouped by Entity Type)`);
    console.log(`${"═".repeat(60)}`);
    console.log(`Table: ${this.options.tableName}`);
    console.log(`Region: ${this.options.region}`);
    console.log(`${"═".repeat(60)}\n`);

    const startTime = Date.now();
    const itemsByType: Record<string, any[]> = {};
    let totalItems = 0;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;
    let scanCount = 0;

    try {
      do {
        scanCount++;
        console.log(`📄 Scanning batch ${scanCount}...`);

        const command: ScanCommand = new ScanCommand({
          TableName: this.options.tableName,
          ExclusiveStartKey: lastEvaluatedKey,
          Limit: this.options.limit,
        });

        const response: ScanCommandOutput = await this.docClient.send(command);
        const items = response.Items || [];

        // Group items by entity type (extracted from PK)
        for (const item of items) {
          const entityType = this.extractEntityType(item);
          if (!itemsByType[entityType]) {
            itemsByType[entityType] = [];
          }
          itemsByType[entityType].push(item);
        }

        totalItems += items.length;
        lastEvaluatedKey = response.LastEvaluatedKey;

        console.log(`   ✓ Found ${items.length} items (${totalItems} total)`);
      } while (lastEvaluatedKey);

      const duration = Date.now() - startTime;

      console.log(`\n✅ Scan complete!`);
      console.log(`   Total items: ${totalItems}`);
      console.log(`   Entity types: ${Object.keys(itemsByType).length}`);
      console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);

      // Show breakdown by entity type
      console.log(`\n📊 Entity Type Breakdown:`);
      Object.entries(itemsByType)
        .sort(([, a], [, b]) => b.length - a.length)
        .forEach(([type, items]) => {
          console.log(`   ${type}: ${items.length} items`);
        });

      // Prepare export data
      const exportData = {
        metadata: {
          tableName: this.options.tableName,
          exportedAt: new Date().toISOString(),
          totalItems,
          entityTypes: Object.keys(itemsByType).length,
          region: this.options.region!,
        },
        itemsByType,
      };

      // Write to file
      const outputPath = this.getOutputFilePath();
      const jsonString = this.options.pretty
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);

      fs.writeFileSync(outputPath, jsonString, "utf-8");

      const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(
        2,
      );

      console.log(`\n💾 File saved!`);
      console.log(`   Path: ${outputPath}`);
      console.log(`   Size: ${fileSizeMB} MB`);

      return outputPath;
    } catch (error) {
      console.error(`\n❌ Export failed:`, error);
      throw error;
    }
  }

  /**
   * Get count of items in table (without fetching all data)
   */
  async getItemCount(): Promise<number> {
    let count = 0;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    do {
      const command: ScanCommand = new ScanCommand({
        TableName: this.options.tableName,
        Select: "COUNT",
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const response: ScanCommandOutput = await this.docClient.send(command);
      count += response.Count || 0;
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return count;
  }

  /**
   * Extract entity type from item (based on PK or SK)
   */
  private extractEntityType(item: any): string {
    // Try to extract from PK
    if (item.PK && typeof item.PK === "string") {
      const match = item.PK.match(/^([A-Z]+)#/);
      if (match) {
        return match[1];
      }
    }

    // Try to extract from SK
    if (item.SK && typeof item.SK === "string") {
      const match = item.SK.match(/^([A-Z]+)#/);
      if (match) {
        return match[1];
      }
    }

    // Fallback to "entityType" field if present
    if (item.entityType) {
      return item.entityType;
    }

    // Legacy: try "id" prefix
    if (item.id && typeof item.id === "string") {
      const parts = item.id.split("-");
      if (parts.length > 0) {
        return parts[0].toUpperCase();
      }
    }

    return "UNKNOWN";
  }

  /**
   * Get output file path
   */
  private getOutputFilePath(): string {
    if (this.options.outputFile) {
      return path.isAbsolute(this.options.outputFile)
        ? this.options.outputFile
        : path.join(this.options.outputDir!, this.options.outputFile);
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const filename = `${this.options.tableName}-export-${timestamp}.json`;
    return path.join(this.options.outputDir!, filename);
  }

  /**
   * Import data from JSON file into DynamoDB table
   */
  async import(
    inputFile: string,
    options?: {
      dryRun?: boolean;
      batchSize?: number;
      overwrite?: boolean;
    },
  ): Promise<{ imported: number; failed: number; skipped: number }> {
    const dryRun = options?.dryRun || false;
    const batchSize = options?.batchSize || 25; // DynamoDB limit
    const overwrite = options?.overwrite !== false; // Default to overwrite

    console.log(`\n📥 DynamoDB Import Tool`);
    console.log(`${"═".repeat(60)}`);
    console.log(`Source: ${inputFile}`);
    console.log(`Table: ${this.options.tableName}`);
    console.log(`Region: ${this.options.region}`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log(`Overwrite: ${overwrite ? "Yes" : "No"}`);
    console.log(`${"═".repeat(60)}\n`);

    // Read and parse the input file
    const filePath = path.isAbsolute(inputFile)
      ? inputFile
      : path.join(process.cwd(), inputFile);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📖 Reading file...`);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Extract items from the data structure
    let items: any[] = [];
    if (Array.isArray(data)) {
      // Simple array of items
      items = data;
    } else if (data.items && Array.isArray(data.items)) {
      // Export format with metadata
      items = data.items;
      console.log(
        `   Found metadata: exported ${data.metadata?.itemCount || "unknown"} items on ${data.metadata?.exportedAt || "unknown date"}`,
      );
    } else if (data.itemsByType) {
      // Grouped export format
      items = Object.values(data.itemsByType).flat();
      console.log(
        `   Found grouped data with ${Object.keys(data.itemsByType).length} entity types`,
      );
    } else {
      throw new Error(
        "Invalid file format. Expected array of items or export format with 'items' or 'itemsByType' field.",
      );
    }

    console.log(`   ✓ Found ${items.length} items to import\n`);

    if (items.length === 0) {
      console.log("⚠️  No items to import");
      return { imported: 0, failed: 0, skipped: 0 };
    }

    if (dryRun) {
      console.log("🔍 DRY RUN MODE - No items will be written\n");
      console.log(`Would import ${items.length} items`);
      console.log(`Batches required: ${Math.ceil(items.length / batchSize)}`);

      // Show sample of first item
      console.log(`\n📋 Sample item (first):`);
      console.log(
        JSON.stringify(items[0], null, 2).split("\n").slice(0, 10).join("\n"),
      );
      if (Object.keys(items[0]).length > 5) {
        console.log("   ... (truncated)");
      }

      return { imported: 0, failed: 0, skipped: items.length };
    }

    // Perform the import
    const startTime = Date.now();
    let imported = 0;
    let failed = 0;

    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(items.length / batchSize);

      console.log(
        `📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`,
      );

      try {
        if (overwrite) {
          // Use BatchWriteCommand for bulk operations
          const putRequests = batch.map((item) => ({
            PutRequest: { Item: item },
          }));

          const command = new BatchWriteCommand({
            RequestItems: {
              [this.options.tableName]: putRequests,
            },
          });

          await this.docClient.send(command);
          imported += batch.length;
          console.log(`   ✓ Imported ${batch.length} items`);
        } else {
          // Use PutCommand with condition to avoid overwriting
          for (const item of batch) {
            try {
              const command = new PutCommand({
                TableName: this.options.tableName,
                Item: item,
                ConditionExpression:
                  "attribute_not_exists(PK) AND attribute_not_exists(id)",
              });

              await this.docClient.send(command);
              imported++;
            } catch (error: any) {
              if (error.name === "ConditionalCheckFailedException") {
                // Item already exists, skip it
                continue;
              }
              throw error;
            }
          }
          console.log(`   ✓ Imported ${imported - (i > 0 ? i : 0)} new items`);
        }
      } catch (error) {
        console.error(`   ❌ Batch ${batchNum} failed:`, error);
        failed += batch.length;
      }

      // Add a small delay to avoid throttling
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const duration = Date.now() - startTime;

    console.log(`\n✅ Import complete!`);
    console.log(`   Items imported: ${imported}`);
    console.log(`   Items failed: ${failed}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(
      `   Throughput: ${(imported / (duration / 1000)).toFixed(0)} items/sec`,
    );

    return { imported, failed, skipped: 0 };
  }

  /**
   * Close DynamoDB connections
   */
  async close(): Promise<void> {
    this.dynamoClient.destroy();
  }
}

/**
 * CLI Argument Parser
 */
interface CliArgs {
  command: "export" | "import" | "count" | "help";
  table?: string;
  file?: string;
  output?: string;
  outputDir?: string;
  region?: string;
  grouped?: boolean;
  filter?: string;
  dryRun?: boolean;
  overwrite?: boolean;
  pretty?: boolean;
  noMetadata?: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    command: "help",
  };

  // Get command (first non-flag argument)
  const commandIndex = args.findIndex((arg) => !arg.startsWith("-"));
  if (commandIndex !== -1) {
    const cmd = args[commandIndex].toLowerCase();
    if (["export", "import", "count", "help"].includes(cmd)) {
      result.command = cmd as CliArgs["command"];
    }
  }

  // Parse flags
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "-t":
      case "--table":
        result.table = nextArg;
        i++;
        break;
      case "-f":
      case "--file":
        result.file = nextArg;
        i++;
        break;
      case "-o":
      case "--output":
        result.output = nextArg;
        i++;
        break;
      case "-d":
      case "--dir":
        result.outputDir = nextArg;
        i++;
        break;
      case "-r":
      case "--region":
        result.region = nextArg;
        i++;
        break;
      case "-g":
      case "--grouped":
        result.grouped = true;
        break;
      case "--filter":
        result.filter = nextArg;
        i++;
        break;
      case "--dry-run":
        result.dryRun = true;
        break;
      case "--no-overwrite":
        result.overwrite = false;
        break;
      case "--compact":
        result.pretty = false;
        break;
      case "--no-metadata":
        result.noMetadata = true;
        break;
      case "-h":
      case "--help":
        result.command = "help";
        break;
    }
  }

  return result;
}

function printHelp() {
  console.log(`
DynamoDB Export/Import Tool
============================

USAGE:
  db-export <command> [options]

COMMANDS:
  export      Export table data to JSON file
  import      Import JSON file data to table
  count       Get item count without exporting
  help        Show this help message

EXPORT OPTIONS:
  -t, --table <name>       Table name (default: from TABLE_NAME env var)
  -o, --output <file>      Output filename (default: auto-generated)
  -d, --dir <directory>    Output directory (default: current directory)
  -r, --region <region>    AWS region (default: from AWS_REGION env var)
  -g, --grouped            Group items by entity type
  --filter <expression>    DynamoDB filter expression
  --compact                Compact JSON output (no pretty-print)
  --no-metadata            Exclude metadata from output

IMPORT OPTIONS:
  -t, --table <name>       Target table name (required)
  -f, --file <path>        Input JSON file (required)
  -r, --region <region>    AWS region (default: from AWS_REGION env var)
  --dry-run                Preview import without writing
  --no-overwrite           Skip existing items (default: overwrite)

COUNT OPTIONS:
  -t, --table <name>       Table name (required)
  -r, --region <region>    AWS region (default: from AWS_REGION env var)

EXAMPLES:
  # Export table
  db-export export -t my-table -o backup.json

  # Export grouped by entity type
  db-export export -t my-table --grouped

  # Export with filter
  db-export export -t my-table --filter "attribute_exists(email)"

  # Import data
  db-export import -t my-table -f backup.json

  # Import with dry-run
  db-export import -t my-table -f backup.json --dry-run

  # Get item count
  db-export count -t my-table

ENVIRONMENT VARIABLES:
  TABLE_NAME              Default table name
  OLD_TABLE_NAME          Fallback table name
  AWS_REGION              Default AWS region
  OUTPUT_FILE             Default output filename
  OUTPUT_DIR              Default output directory
  GROUP_BY_TYPE           Group by entity type (true/false)
  FILTER_EXPRESSION       Default filter expression

For more information, see: src/tools/db-export/README.md
  `);
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Show help
  if (args.command === "help" || process.argv.length === 2) {
    printHelp();
    process.exit(0);
  }

  // Get table name
  const tableName =
    args.table ||
    process.env['TABLE_NAME'] ||
    process.env['OLD_TABLE_NAME'] ||
    "construction-app-dev-construction-table";

  const region = args.region || process.env['AWS_REGION'];

  // Handle different commands
  switch (args.command) {
    case "export": {
      const exporter = new DynamoDBExporter({
        tableName,
        region,
        outputFile: args.output || process.env['OUTPUT_FILE'],
        outputDir: args.outputDir || process.env['OUTPUT_DIR'] || process.cwd(),
        filterExpression: args.filter || process.env['FILTER_EXPRESSION'],
        pretty: args.pretty !== false,
        includeMetadata: !args.noMetadata,
      });

      try {
        if (args.grouped || process.env['GROUP_BY_TYPE'] === "true") {
          await exporter.exportByEntityType();
        } else {
          await exporter.export();
        }

        console.log(`\n✨ Export completed successfully!\n`);
        process.exit(0);
      } catch (error) {
        console.error(`\n💥 Export failed:`, error);
        process.exit(1);
      } finally {
        await exporter.close();
      }
      break;
    }

    case "import": {
      if (!args.file) {
        console.error("❌ Error: Input file is required for import command");
        console.error("Usage: db-export import -t <table> -f <file>");
        process.exit(1);
      }

      const exporter = new DynamoDBExporter({
        tableName,
        region,
      });

      try {
        const result = await exporter.import(args.file, {
          dryRun: args.dryRun,
          overwrite: args.overwrite,
        });

        if (!args.dryRun) {
          console.log(`\n✨ Import completed successfully!\n`);
          console.log(`Summary:`);
          console.log(`  Imported: ${result.imported}`);
          console.log(`  Failed: ${result.failed}`);
          console.log(`  Skipped: ${result.skipped}`);
        }
        process.exit(0);
      } catch (error) {
        console.error(`\n💥 Import failed:`, error);
        process.exit(1);
      } finally {
        await exporter.close();
      }
      break;
    }

    case "count": {
      const exporter = new DynamoDBExporter({
        tableName,
        region,
      });

      try {
        console.log(`\n📊 Counting items in table: ${tableName}\n`);
        const count = await exporter.getItemCount();
        console.log(`✅ Total items: ${count.toLocaleString()}\n`);
        process.exit(0);
      } catch (error) {
        console.error(`\n💥 Count failed:`, error);
        process.exit(1);
      } finally {
        await exporter.close();
      }
      break;
    }

    default:
      console.error(`❌ Unknown command: ${args.command}`);
      printHelp();
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default DynamoDBExporter;
