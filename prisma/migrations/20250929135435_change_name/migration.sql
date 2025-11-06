/*
  Warnings:

  - You are about to drop the `Building` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Building";

-- CreateTable
CREATE TABLE "public"."building" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "images" TEXT,
    "city" TEXT,
    "country" TEXT,
    "description" TEXT,
    "longtitude" TEXT,
    "latitude" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roomsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "building_pkey" PRIMARY KEY ("id")
);
