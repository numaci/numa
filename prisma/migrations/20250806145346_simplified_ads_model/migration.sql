/*
  Warnings:

  - You are about to drop the column `bgColor` on the `ad` table. All the data in the column will be lost.
  - You are about to drop the column `buttonText` on the `ad` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `ad` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ad` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `ad` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `ad` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ad` table. All the data in the column will be lost.
  - Made the column `imageUrl` on table `ad` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ad` DROP FOREIGN KEY `Ad_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `ad` DROP FOREIGN KEY `Ad_productId_fkey`;

-- DropIndex
DROP INDEX `Ad_categoryId_fkey` ON `ad`;

-- DropIndex
DROP INDEX `Ad_productId_fkey` ON `ad`;

-- AlterTable
ALTER TABLE `ad` DROP COLUMN `bgColor`,
    DROP COLUMN `buttonText`,
    DROP COLUMN `categoryId`,
    DROP COLUMN `description`,
    DROP COLUMN `order`,
    DROP COLUMN `productId`,
    DROP COLUMN `title`,
    MODIFY `imageUrl` VARCHAR(191) NOT NULL;
