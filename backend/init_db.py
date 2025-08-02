import sqlite3

# Connect to a Database (creates a DB if it doesn't exist)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# creates the asset table
cursor.execute('''
              CREATE TABLE IF NOT EXISTS assets (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  type TEXT NOT NULL,
                  format TEXT NOT NULL
              )
              ''')

#save and close
conn.commit()
conn.close()

print("Database and 'assets' table created.")
