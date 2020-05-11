'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('CommentReactions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      UserId: {
        type: DataTypes.INTEGER,
        references: { key: 'id', model: 'Users' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        allowNull: false,
      },
      CommentId: {
        type: DataTypes.INTEGER,
        references: { key: 'id', model: 'Comments' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        allowNull: false,
      },
      emoji: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('CommentReactions', ['CommentId']);
    await queryInterface.addIndex('CommentReactions', ['UserId', 'CommentId', 'emoji'], {
      indexName: `CommentReactions_UserId_CommentId_emoji`,
      indicesType: 'UNIQUE',
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('CommentReactions');
  },
};
