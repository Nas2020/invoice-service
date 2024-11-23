import { Database } from 'bun:sqlite';
import { getEnvConfig } from '../config/env';

export interface InvoiceRecord {
  id: number;
  invoice_number: string;
  created_at: string;
  client_name: string;
  amount: number;
  status: string;
  pdf_path: string;
}

export const initDB = () => {
  const config = getEnvConfig();
  const db = new Database(config.DATABASE_PATH);

  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      created_at TEXT NOT NULL,
      client_name TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'generated',
      pdf_path TEXT
    )
  `);

  return db;
};

export const dbUtils = {
  getAllInvoices: (db: Database): InvoiceRecord[] => {
    return db.prepare('SELECT * FROM invoices ORDER BY created_at DESC')
      .all() as InvoiceRecord[];
  },

  getInvoice: (db: Database, invoiceNumber: string): InvoiceRecord | undefined => {
    return db.prepare('SELECT * FROM invoices WHERE invoice_number = ?')
      .get(invoiceNumber) as InvoiceRecord | undefined;
  },

  deleteInvoice: (db: Database, invoiceNumber: string): boolean => {
    const result = db.prepare('DELETE FROM invoices WHERE invoice_number = ?')
      .run(invoiceNumber);
    return result.changes > 0;
  },

  deleteAllInvoices: (db: Database): number => {
    const result = db.prepare('DELETE FROM invoices').run();
    return result.changes;
  },

  getInvoiceCount: (db: Database): number => {
    const result = db.prepare('SELECT COUNT(*) as count FROM invoices')
      .get() as { count: number };
    return result.count;
  }
};