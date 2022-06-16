module.exports = class Data1655201193546 {
  name = 'Data1655201193546'

  async up(db) {
    await db.query(`ALTER TABLE "historical_balance" RENAME COLUMN "date" TO "timestamp"`)
    await db.query(`ALTER TABLE "account" ADD "wallet" text NOT NULL`)
    await db.query(`ALTER TABLE "historical_balance" DROP COLUMN "timestamp"`)
    await db.query(`ALTER TABLE "historical_balance" ADD "timestamp" numeric NOT NULL`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "historical_balance" RENAME COLUMN "timestamp" TO "date"`)
    await db.query(`ALTER TABLE "account" DROP COLUMN "wallet"`)
    await db.query(`ALTER TABLE "historical_balance" ADD "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL`)
    await db.query(`ALTER TABLE "historical_balance" DROP COLUMN "timestamp"`)
  }
}
