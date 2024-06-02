/*
  Warnings:

  - You are about to drop the `_BadgeToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BadgeToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_BadgeUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BadgeUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BadgeUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_BadgeUser_AB_unique" ON "_BadgeUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BadgeUser_B_index" ON "_BadgeUser"("B");
