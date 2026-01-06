import { Injectable } from '@nestjs/common'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

@Injectable()
export class DatabaseService {
  private readonly sqlite: Database.Database
  readonly db: ReturnType<typeof drizzle>

  constructor() {
    const dbFile = resolve(process.env.DB_FILE ?? './.data/app.db')
    const dir = dirname(dbFile)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    this.sqlite = new Database(dbFile)
    this.sqlite.pragma('journal_mode = WAL')
    this.db = drizzle(this.sqlite)
    const cwd = process.cwd()
    const candidates = [resolve(cwd, 'drizzle'), resolve(cwd, 'apps/api/drizzle')]
    const folder = candidates.find((p) => existsSync(resolve(p, 'meta/_journal.json')))
    if (!folder) {
      throw new Error('Missing Drizzle migrations folder')
    }
    migrate(this.db, { migrationsFolder: folder })
  }
}


