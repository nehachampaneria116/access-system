const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 255]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    isMaster: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_master'
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Define associations
User.associate = (models) => {
  User.hasMany(models.Session, {
    foreignKey: 'user_id',
    as: 'sessions',
    onDelete: 'CASCADE'
  });
};

module.exports = User;

