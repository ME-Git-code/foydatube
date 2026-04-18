require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const schemaPath = path.resolve(__dirname, "../db/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  const client = new Client({
    connectionString: databaseUrl,
  });

  await client.connect();

  try {
    await client.query(schemaSql);
    console.log("Schema applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to apply schema.");
  console.error(error);
  process.exit(1);
});
