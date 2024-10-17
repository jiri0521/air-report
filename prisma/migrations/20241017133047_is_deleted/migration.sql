/*
  Warnings:

  - Added the required column `isDeleted` to the `incidents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL;
