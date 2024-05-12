/*
  Warnings:

  - You are about to drop the column `subModuleProgressId` on the `Trophy` table. All the data in the column will be lost.
  - Added the required column `moduleProgressId` to the `Trophy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "userId" TEXT NOT NULL,
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "Trophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trophy_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trophy" ("id", "level", "status", "title", "userId") SELECT "id", "level", "status", "title", "userId" FROM "Trophy";
DROP TABLE "Trophy";
ALTER TABLE "new_Trophy" RENAME TO "Trophy";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
