/*
  Warnings:

  - You are about to drop the column `userId` on the `Badge` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "locked_description" TEXT NOT NULL,
    "unlocked_description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "Badge_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description") SELECT "id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
