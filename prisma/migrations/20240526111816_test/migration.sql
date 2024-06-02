/*
  Warnings:

  - A unique constraint covering the columns `[testId]` on the table `ModuleProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testId]` on the table `SubModuleProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ModuleProgress_testId_key" ON "ModuleProgress"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "SubModuleProgress_testId_key" ON "SubModuleProgress"("testId");
