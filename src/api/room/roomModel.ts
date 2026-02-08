import { db } from "../../db/connection.js";
import { DataTypes, Model } from "sequelize";
import { User } from "../user/userModel.js";


export interface RoomInstance extends Model {
  id: number;
  name: string;
  createdBy: number;
}
export const Room = db.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "rooms",
    timestamps: true,
  },
);

User.hasMany(Room, { foreignKey: "createdBy" });
Room.belongsTo(User, { foreignKey: "createdBy" });
