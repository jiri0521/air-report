/*
  Warnings:

  - Made the column `workStatus` on table `Incident` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Incident" ALTER COLUMN "workStatus" SET NOT NULL;
