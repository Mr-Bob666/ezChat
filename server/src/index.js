import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import sequelize from './config/database.js';
import config from './config/index.js';
import { initializeSocket } from './socket/index.js';
import { seedRooms, migrateOwnerRoles, migrateInviteCodes } from './utils/seed.js';

/**
 * Clean up duplicate indexes created by Sequelize sync({ alter: true }).
 * Sequelize has a known bug where it re-creates unique indexes on every startup,
 * eventually hitting MySQL's 64-index limit per table.
 */
async function cleanupDuplicateIndexes() {
  const [tables] = await sequelize.query('SHOW TABLES');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);

    // Group indexes by the set of columns they cover
    const indexGroups = {};
    for (const idx of indexes) {
      const key = idx.Key_name;
      if (!indexGroups[key]) indexGroups[key] = [];
      indexGroups[key].push(idx.Column_name);
    }

    // For each group of columns, find duplicate indexes
    const columnSetToNames = {};
    for (const [name, cols] of Object.entries(indexGroups)) {
      const key = cols.sort().join(',');
      if (!columnSetToNames[key]) columnSetToNames[key] = [];
      columnSetToNames[key].push(name);
    }

    // Drop duplicates, keeping the first one (prefer PRIMARY or *_unique names)
    for (const names of Object.values(columnSetToNames)) {
      if (names.length <= 1) continue;
      // Sort: keep PRIMARY first, then *_unique, then alphabetically
      names.sort((a, b) => {
        if (a === 'PRIMARY') return -1;
        if (b === 'PRIMARY') return 1;
        if (a.endsWith('_unique') && !b.endsWith('_unique')) return -1;
        if (!a.endsWith('_unique') && b.endsWith('_unique')) return 1;
        return a.localeCompare(b);
      });
      const toDrop = names.slice(1);
      for (const dropName of toDrop) {
        await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${dropName}\``);
      }
    }
  }
}

const PORT = config.port;

async function start() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync models (alter: updates schema without dropping data; force: drops all data)
    if (config.db.forceSync) {
      await sequelize.sync({ force: true });
    } else {
      await sequelize.sync({ alter: true });
    }
    console.log('Database synced');

    // Clean up duplicate indexes created by Sequelize alter sync
    await cleanupDuplicateIndexes();

    // Seed default rooms & fix legacy owner roles & generate invite codes
    await seedRooms();
    await migrateOwnerRoles();
    await migrateInviteCodes();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = new Server(httpServer, {
      cors: { origin: config.clientUrl, credentials: true },
    });
    app.set('io', io);
    initializeSocket(io);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
