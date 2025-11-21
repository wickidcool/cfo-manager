# DynamoDB Export/Import - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Export a Table

```bash
# Basic export (uses TABLE_NAME from env)
npm run db:export

# Export specific table
npm run db-export export -t my-table -o backup.json

# Export grouped by entity type
npm run db:export:grouped
```

### Import Data

```bash
# Preview first (dry run)
npm run db-export import -t my-table -f backup.json --dry-run

# Import for real
npm run db-export import -t my-table -f backup.json
```

### Get Item Count

```bash
npm run db:count -- -t my-table
```

## 📋 Common Commands

| Task                  | Command                                                   |
| --------------------- | --------------------------------------------------------- |
| Export default table  | `npm run db:export`                                       |
| Export specific table | `npm run db-export export -t <table>`                     |
| Export with filter    | `npm run db-export export -t <table> --filter "..."`      |
| Export grouped        | `npm run db:export:grouped`                               |
| Import with preview   | `npm run db-export import -t <table> -f <file> --dry-run` |
| Import data           | `npm run db:import -- -t <table> -f <file>`               |
| Get count             | `npm run db:count -- -t <table>`                          |

## 🔥 Real-World Examples

### Daily Backup

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d)
npm run db-export export \
  -t construction-app-prod-construction-table \
  -o "prod-backup-${DATE}.json" \
  -d ./backups
```

### Clone Table to Another Region

```bash
# Export from us-east-1
npm run db-export export -t my-table -r us-east-1 -o export.json

# Import to us-west-2
npm run db-export import -t my-table -r us-west-2 -f export.json
```

### Migrate Between Environments

```bash
# Export from dev
npm run db-export export -t dev-table -o dev-data.json

# Import to staging (without overwriting)
npm run db-export import -t staging-table -f dev-data.json --no-overwrite
```

### Export Filtered Data

```bash
# Export only active users
npm run db-export export \
  -t users-table \
  --filter "attribute_exists(email) AND #status = :active" \
  -o active-users.json
```

## 🎯 CLI Reference

### Commands

- `export` - Export table to JSON
- `import` - Import JSON to table
- `count` - Get item count
- `help` - Show help

### Common Flags

- `-t, --table` - Table name
- `-f, --file` - File path (import)
- `-o, --output` - Output file (export)
- `-r, --region` - AWS region
- `--dry-run` - Preview without writing
- `--grouped` - Group by entity type
- `--filter` - Filter expression

## ⚡ Shortcuts

```bash
# Quick backup
npm run db:export

# Quick restore
npm run db:import -- -t my-table -f backup.json

# Quick check
npm run db:count -- -t my-table

# Full help
npm run db-export help
```

## 🛡️ Safety Tips

1. **Always use dry-run first for imports:**

   ```bash
   npm run db-export import -t my-table -f data.json --dry-run
   ```

2. **Backup before importing:**

   ```bash
   npm run db:export  # Backup first
   npm run db:import -- -t my-table -f new-data.json
   ```

3. **Use --no-overwrite for safe imports:**

   ```bash
   npm run db-export import -t my-table -f data.json --no-overwrite
   ```

4. **Test with small datasets first**
5. **Monitor CloudWatch during large imports**
6. **Use on-demand billing for large imports**

## 📖 Full Documentation

See [README.md](./README.md) for complete documentation, including:

- Programmatic usage
- Advanced examples
- Troubleshooting guide
- Output formats
- Performance tips

## 🆘 Quick Troubleshooting

| Issue             | Solution                                         |
| ----------------- | ------------------------------------------------ |
| "Table not found" | Check table name with `aws dynamodb list-tables` |
| "Access denied"   | Check IAM permissions for Scan/PutItem           |
| "File not found"  | Use absolute path or check file location         |
| "Invalid JSON"    | Validate with `cat file.json \| jq .`            |
| Throttling        | Reduce batch size or use on-demand billing       |

## 💡 Pro Tips

- **Use environment variables for defaults:**

  ```bash
  export TABLE_NAME=my-default-table
  npm run db:export  # Uses TABLE_NAME
  ```

- **Combine with jq for analysis:**

  ```bash
  npm run db:export
  cat export.json | jq '.items | length'
  ```

- **Automate with cron:**

  ```bash
  # Add to crontab
  0 2 * * * cd /path/to/project && npm run db:export
  ```

- **Compress large exports:**
  ```bash
  npm run db:export
  gzip export-*.json
  ```

That's it! You're ready to export and import DynamoDB tables. 🎉
