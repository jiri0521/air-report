-- CreateTable
CREATE TABLE "Incident" (
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

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);


