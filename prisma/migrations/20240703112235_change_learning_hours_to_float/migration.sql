/*
  Warnings:

  - You are about to alter the column `hours` on the `LearningTime` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LearningTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hours" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LearningTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LearningTime" ("date", "hours", "id", "userId") SELECT "date", "hours", "id", "userId" FROM "LearningTime";
DROP TABLE "LearningTime";
ALTER TABLE "new_LearningTime" RENAME TO "LearningTime";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
