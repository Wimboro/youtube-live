const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'stream_config.db');
    this.db = null;
    this.initialize();
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      const createConfigTable = `
        CREATE TABLE IF NOT EXISTS stream_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createUniqueIndex = `
        CREATE UNIQUE INDEX IF NOT EXISTS idx_config_key ON stream_config(key)
      `;

      this.db.run(createConfigTable, (err) => {
        if (err) {
          console.error('Error creating config table:', err.message);
          reject(err);
        } else {
          this.db.run(createUniqueIndex, (err) => {
            if (err) {
              console.error('Error creating index:', err.message);
              reject(err);
            } else {
              console.log('Database tables initialized successfully');
              this.initializeDefaults()
                .then(resolve)
                .catch(reject);
            }
          });
        }
      });
    });
  }

  initializeDefaults() {
    return new Promise((resolve, reject) => {
      const defaults = [
        { key: 'streamKey', value: process.env.YOUTUBE_STREAM_KEY || '' },
        { key: 'twitchStreamKey', value: process.env.TWITCH_STREAM_KEY || '' },
        { key: 'facebookStreamKey', value: process.env.FACEBOOK_STREAM_KEY || '' },
        { key: 'mediaDirectory', value: process.env.MEDIA_DIRECTORY || './media' },
        { key: 'randomize', value: 'true' },
        { key: 'loop', value: 'true' },
        { key: 'platform', value: 'youtube' },
        { key: 'multiPlatform', value: 'false' }
      ];

      let completed = 0;
      const total = defaults.length;

      if (total === 0) {
        resolve();
        return;
      }

      defaults.forEach(config => {
        this.getConfig(config.key)
          .then(existing => {
            if (!existing) {
              return this.setConfig(config.key, config.value);
            }
            return Promise.resolve();
          })
          .then(() => {
            completed++;
            if (completed === total) {
              resolve();
            }
          })
          .catch(reject);
      });
    });
  }

  getConfig(key) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT value FROM stream_config WHERE key = ?';
      this.db.get(query, [key], (err, row) => {
        if (err) {
          console.error('Error getting config:', err.message);
          reject(err);
        } else {
          resolve(row ? row.value : null);
        }
      });
    });
  }

  setConfig(key, value) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO stream_config (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;
      
      this.db.run(query, [key, value], function(err) {
        if (err) {
          console.error('Error setting config:', err.message);
          reject(err);
        } else {
          console.log(`Config updated: ${key} = ${value}`);
          resolve(this.lastID);
        }
      });
    });
  }

  getAllConfig() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT key, value FROM stream_config';
      this.db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error getting all config:', err.message);
          reject(err);
        } else {
          const config = {};
          rows.forEach(row => {
            // Convert string booleans back to actual booleans
            if (row.value === 'true' || row.value === 'false') {
              config[row.key] = row.value === 'true';
            } else {
              config[row.key] = row.value;
            }
          });
          resolve(config);
        }
      });
    });
  }

  updateMultipleConfig(configObj) {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(configObj);
      let completed = 0;
      const total = keys.length;

      if (total === 0) {
        resolve();
        return;
      }

      keys.forEach(key => {
        let value = configObj[key];
        // Convert booleans to strings for storage
        if (typeof value === 'boolean') {
          value = value.toString();
        }

        this.setConfig(key, value)
          .then(() => {
            completed++;
            if (completed === total) {
              resolve();
            }
          })
          .catch(reject);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Database;