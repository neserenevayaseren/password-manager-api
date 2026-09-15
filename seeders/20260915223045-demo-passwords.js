'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Passwords', [
      {
        title: 'GitHub',
        siteUrl: 'https://github.com',
        username: 'dasha_dev',
        encryptedPassword: 'U2FsdGVkX1+Example1',
        category: 'Разработка',
        isFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'VKontakte',
        siteUrl: 'https://vk.com',
        username: 'dasha_user',
        encryptedPassword: 'U2FsdGVkX1+Example2',
        category: 'Соцсети',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Passwords', null, {});
  }
};