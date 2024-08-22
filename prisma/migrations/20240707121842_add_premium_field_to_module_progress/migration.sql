/*
  Warnings:

  - A unique constraint covering the columns `[moduleProgressId,subModuleProgressId]` on the table `Checkpoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "premium" BOOLEAN NOT NULL DEFAULT true,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "ModuleProgress_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ModuleProgress" ("courseProgressId", "id", "order", "score", "slug", "status", "title") SELECT "courseProgressId", "id", "order", "score", "slug", "status", "title" FROM "ModuleProgress";
DROP TABLE "ModuleProgress";
ALTER TABLE "new_ModuleProgress" RENAME TO "ModuleProgress";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_moduleProgressId_subModuleProgressId_key" ON "Checkpoint"("moduleProgressId", "subModuleProgressId");
