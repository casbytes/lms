/*
  Warnings:

  - You are about to drop the `_BadgeUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_BadgeUser_B_index";

-- DropIndex
DROP INDEX "_BadgeUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BadgeUser";
PRAGMA foreign_keys=on;

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
    "userId" TEXT NOT NULL,
    CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Badge_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description") SELECT "id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
