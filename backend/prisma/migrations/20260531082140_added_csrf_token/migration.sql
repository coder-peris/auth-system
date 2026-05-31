/*
  Warnings:

  - A unique constraint covering the columns `[csrfToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `csrfToken` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "csrfToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_csrfToken_key" ON "Session"("csrfToken");
