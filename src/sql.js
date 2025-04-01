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
      type: DataTypes.ENUM("customer", "admin"),
      defaultValue: "customer",
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
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
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
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: (order) => {
        const date = new Date();
        const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        order.orderNumber = `${prefix}-${random}`;
      },
    },
  },
);

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
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
    carrier: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "exception",
      ),
      defaultValue: "pending",
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
    },
    currentLocation: {
      type: DataTypes.STRING,
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

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

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
  OrderItem,
  Tracking,
  TrackingHistory,
};
