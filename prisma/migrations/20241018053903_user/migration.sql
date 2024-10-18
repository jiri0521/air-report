/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `incidents` table. All the data in the column will be lost.
  - Added the required column `email` to the `UserSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `UserSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "incidents" DROP COLUMN "isDeleted";
