import { DataTypes, type Model } from "sequelize";
import { db } from "../../db/connection.js";
import { User } from "../user/userModel.js";
import { Room } from "../room/roomModel.js";

export interface BookingInstance extends Model {
  id: number;
  userId: number;
  roomId: number;
  title: string;
  start_at: Date;
  end_at: Date;
  status: "in_progress" | "cancelled" | "completed" | "pending";
}

export const Booking = db.define(
    "Booking",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "rooms",
                key: "id",
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    status: {
            type: DataTypes.ENUM("in_progress", "cancelled", "completed", "pending"),
            allowNull: false,
            defaultValue: "pending",
        },
    },
    {
        tableName: "bookings",
        timestamps: true,
    },
);

User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

Room.hasMany(Booking, { foreignKey: "roomId" });
Booking.belongsTo(Room, { foreignKey: "roomId" });
