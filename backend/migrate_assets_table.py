import sqlite3

DB_PATH = "database.db"


conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 1. Create new table with corrected column name
cursor.execute('''
    CREATE TABLE IF NOT EXISTS new_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        file_format TEXT NOT NULL
    )
''')

# 2. Copy existing data over
cursor.execute('''
    INSERT INTO new_assets (id, name, type, file_format)
    SELECT id, name, type, format FROM assets
''')

# 3. Drop old table
cursor.execute('DROP TABLE assets')

# 4. Rename new table to original name
cursor.execute('ALTER TABLE new_assets RENAME TO assets')

conn.commit()
conn.close()

print("Migration complete: Renamed column 'format' to 'file_format'")
