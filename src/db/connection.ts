import { Sequelize } from "sequelize";
import { config } from "../../config/index.js";

export const db = new Sequelize(config.database_url as string, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
