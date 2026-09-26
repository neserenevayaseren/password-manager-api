'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Password extends Model {
    static associate(models) {
    }
  }
  Password.init({
    title: DataTypes.STRING,
    siteUrl: DataTypes.STRING,
    username: DataTypes.STRING,
    encryptedPassword: DataTypes.TEXT,
    category: DataTypes.STRING,
    isFavorite: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Password',
  });
  return Password;
};