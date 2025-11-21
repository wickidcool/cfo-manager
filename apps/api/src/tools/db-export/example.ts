/**
 * Example usage of the DynamoDB Export Tool
 *
 * This file demonstrates various ways to use the export tool programmatically.
 */

import DynamoDBExporter from "./index";

/**
 * Example 1: Basic export
 */
async function basicExport() {
  console.log("\n=== Example 1: Basic Export ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
  });

  try {
    const filePath = await exporter.export();
    console.log(`\nSuccess! Export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 2: Export with custom filename
 */
async function exportWithCustomFilename() {
  console.log("\n=== Example 2: Export with Custom Filename ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
    outputFile: "my-custom-export.json",
    outputDir: "./exports",
  });

  try {
    const filePath = await exporter.export();
    console.log(`\nSuccess! Export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 3: Export grouped by entity type
 */
async function exportGroupedByType() {
  console.log("\n=== Example 3: Export Grouped by Entity Type ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
    outputFile: "grouped-export.json",
  });

  try {
    const filePath = await exporter.exportByEntityType();
    console.log(`\nSuccess! Grouped export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 4: Export with filtering
 */
async function exportWithFilter() {
  console.log("\n=== Example 4: Export with Filter Expression ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
    filterExpression: "attribute_exists(email)",
    outputFile: "filtered-export.json",
  });

  try {
    const filePath = await exporter.export();
    console.log(`\nSuccess! Filtered export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 5: Get item count without exporting
 */
async function getItemCount() {
  console.log("\n=== Example 5: Get Item Count ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
  });

  try {
    const count = await exporter.getItemCount();
    console.log(`\nTable contains ${count.toLocaleString()} items`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 6: Export without metadata (items only)
 */
async function exportItemsOnly() {
  console.log("\n=== Example 6: Export Items Only (No Metadata) ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
    includeMetadata: false,
    outputFile: "items-only.json",
  });

  try {
    const filePath = await exporter.export();
    console.log(`\nSuccess! Items-only export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 7: Compact export (no pretty-print)
 */
async function compactExport() {
  console.log("\n=== Example 7: Compact Export (No Pretty-Print) ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
    pretty: false,
    outputFile: "compact-export.json",
  });

  try {
    const filePath = await exporter.export();
    console.log(`\nSuccess! Compact export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 8: Export with complex filter
 */
async function exportWithComplexFilter() {
  console.log("\n=== Example 8: Export with Complex Filter ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
    filterExpression:
      "attribute_exists(#email) AND begins_with(#pk, :userPrefix)",
    expressionAttributeNames: {
      "#email": "email",
      "#pk": "PK",
    },
    expressionAttributeValues: {
      ":userPrefix": "USER#",
    },
    outputFile: "users-export.json",
  });

  try {
    const filePath = await exporter.export();
    console.log(`\nSuccess! Users export saved to: ${filePath}`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 9: Basic import
 */
async function basicImport() {
  console.log("\n=== Example 9: Basic Import ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
  });

  try {
    const result = await exporter.import("./export-data.json");
    console.log(`\nSuccess! Imported ${result.imported} items`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 10: Import with dry run
 */
async function importDryRun() {
  console.log("\n=== Example 10: Import Dry Run ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
  });

  try {
    const result = await exporter.import("./export-data.json", {
      dryRun: true,
    });
    console.log(`\nDry run complete! Would import ${result.skipped} items`);
  } finally {
    await exporter.close();
  }
}

/**
 * Example 11: Import without overwriting
 */
async function importNoOverwrite() {
  console.log("\n=== Example 11: Import Without Overwriting ===\n");

  const exporter = new DynamoDBExporter({
    tableName: "construction-app-dev-construction-table",
    region: "us-east-2",
  });

  try {
    const result = await exporter.import("./export-data.json", {
      overwrite: false,
    });
    console.log(
      `\nSuccess! Imported ${result.imported} new items, skipped ${result.skipped} existing`,
    );
  } finally {
    await exporter.close();
  }
}

/**
 * Main function to run examples
 */
async function main() {
  const exampleNumber = process.argv[2];

  if (!exampleNumber) {
    console.log(`
Usage: ts-node example.ts <example-number>

Available examples:
  Export Examples:
    1 - Basic export
    2 - Export with custom filename
    3 - Export grouped by entity type
    4 - Export with filtering
    5 - Get item count only
    6 - Export without metadata
    7 - Compact export (no pretty-print)
    8 - Export with complex filter

  Import Examples:
    9  - Basic import
    10 - Import with dry run
    11 - Import without overwriting

Example:
  ts-node example.ts 1
    `);
    process.exit(0);
  }

  try {
    switch (exampleNumber) {
      case "1":
        await basicExport();
        break;
      case "2":
        await exportWithCustomFilename();
        break;
      case "3":
        await exportGroupedByType();
        break;
      case "4":
        await exportWithFilter();
        break;
      case "5":
        await getItemCount();
        break;
      case "6":
        await exportItemsOnly();
        break;
      case "7":
        await compactExport();
        break;
      case "8":
        await exportWithComplexFilter();
        break;
      case "9":
        await basicImport();
        break;
      case "10":
        await importDryRun();
        break;
      case "11":
        await importNoOverwrite();
        break;
      default:
        console.error(`Unknown example number: ${exampleNumber}`);
        process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error running example:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
