-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "snowflake" BIGINT NOT NULL PRIMARY KEY,
    "available_codes" INTEGER NOT NULL DEFAULT 0,
    "extra_codes" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("snowflake") SELECT "snowflake" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
