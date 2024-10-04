/*
  Warnings:

  - You are about to drop the `Incident` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Incident";

-- CreateTable
CREATE TABLE "incidents" (
    "id" SERIAL NOT NULL,
    "patientGender" TEXT NOT NULL,
    "patientAge" TEXT NOT NULL,
    "patientRespirator" TEXT NOT NULL,
    "patientDialysis" TEXT NOT NULL,
    "involvedPartyProfession" TEXT NOT NULL,
    "involvedPartyExperience" TEXT NOT NULL,
    "discovererProfession" TEXT NOT NULL,
    "occurrenceDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "reportToDoctor" TIMESTAMP(3) NOT NULL,
    "reportToSupervisor" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "lifeThreat" TEXT NOT NULL,
    "trustImpact" TEXT NOT NULL,
    "impactLevel" TEXT NOT NULL,
    "cause" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "workStatus" TEXT NOT NULL,
    "involvedPartyFactors" TEXT[],
    "workBehavior" TEXT[],
    "physicalCondition" TEXT[],
    "psychologicalState" TEXT[],
    "medicalEquipment" TEXT[],
    "medication" TEXT[],
    "system" TEXT[],
    "cooperation" TEXT[],
    "explanation" TEXT[],

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);
