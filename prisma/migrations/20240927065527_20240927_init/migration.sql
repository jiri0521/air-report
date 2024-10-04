/*
  Warnings:

  - Added the required column `workStatus` to the `Incident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "cooperation" TEXT[],
ADD COLUMN     "explanation" TEXT[],
ADD COLUMN     "involvedPartyFactors" TEXT[],
ADD COLUMN     "medicalEquipment" TEXT[],
ADD COLUMN     "medication" TEXT[],
ADD COLUMN     "physicalCondition" TEXT[],
ADD COLUMN     "psychologicalState" TEXT[],
ADD COLUMN     "system" TEXT[],
ADD COLUMN     "workBehavior" TEXT[],
ADD COLUMN     "workStatus" TEXT;
