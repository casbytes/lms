/*
  Warnings:

  - Added the required column `order` to the `LessonProgress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LessonProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "subModuleProgressId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "LessonProgress_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LessonProgress" ("id", "slug", "status", "subModuleProgressId", "title") SELECT "id", "slug", "status", "subModuleProgressId", "title" FROM "LessonProgress";
DROP TABLE "LessonProgress";
ALTER TABLE "new_LessonProgress" RENAME TO "LessonProgress";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
