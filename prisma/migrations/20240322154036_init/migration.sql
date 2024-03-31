-- CreateTable
CREATE TABLE "User" (
    "snowflake" BIGINT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "AccessCode" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exp" DATETIME,
    "nbf" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" BIGINT NOT NULL,
    "used_by_id" BIGINT,
    "used_at" DATETIME,
    CONSTRAINT "AccessCode_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("snowflake") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccessCode_used_by_id_fkey" FOREIGN KEY ("used_by_id") REFERENCES "User" ("snowflake") ON DELETE SET NULL ON UPDATE CASCADE
);
