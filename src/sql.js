const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.POSTGRES_DATABASE,
  process.env.POSTGRES_USERNAME,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
  },
);

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    role: {
      type: DataTypes.ENUM("rider", "driver", "admin"),
      defaultValue: "rider",
    },
  },
  {
    timestamps: true,
    paranoid: true,
  },
);

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    pickupLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dropoffLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    distance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "searching",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
    },
    scheduledTime: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: (order) => {
        const date = new Date();
        const prefix = `RIDE${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        order.orderNumber = `${prefix}-${random}`;
      },
    },
  },
);

const Tracking = sequelize.define(
  "Tracking",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "en_route_to_pickup",
        "arrived_at_pickup",
        "in_transit",
        "arrived_at_dropoff",
        "completed",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    currentLocation: {
      type: DataTypes.STRING,
    },
    estimatedArrival: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: (tracking) => {
        if (!tracking.trackingNumber) {
          const prefix = "TRK";
          const timestamp = Date.now().toString().slice(-8);
          const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
          tracking.trackingNumber = `${prefix}${timestamp}${random}`;
        }
      },
    },
  },
);

const TrackingHistory = sequelize.define(
  "TrackingHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  },
);

// Define relationships
User.hasMany(Order, { foreignKey: "riderId" });
Order.belongsTo(User, { as: "rider", foreignKey: "riderId" });

User.hasMany(Order, { foreignKey: "driverId" });
Order.belongsTo(User, { as: "driver", foreignKey: "driverId" });

Order.hasOne(Tracking);
Tracking.belongsTo(Order);

Tracking.hasMany(TrackingHistory);
TrackingHistory.belongsTo(Tracking);

sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synchronized"))
  .catch((err) => console.error("Error syncing database:", err));

module.exports = {
  sequelize,
  User,
  Order,
  Tracking,
  TrackingHistory,
};
