import config from 'config';
import debugLib from 'debug';
import pg from 'pg';
import Sequelize from 'sequelize';

import { getDBConf } from '../lib/db';
import logger from '../lib/logger';

// this is needed to prevent sequelize from converting integers to strings, when model definition isn't clear
// like in case of the key totalOrders and raw query (like User.getTopBackers())
pg.defaults.parseInt8 = true;

const dbConfig = getDBConf('database');
const debug = debugLib('psql');

/**
 * Database connection.
 */
logger.info(`Connecting to postgres://${dbConfig.host}/${dbConfig.database}`);

// If we launch the process with DEBUG=psql, we log the postgres queries
if (process.env.DEBUG && process.env.DEBUG.match(/psql/)) {
  config.database.options.logging = true;
}

if (process.env.PGSSLMODE === 'require') {
  config.database.options.dialectOptions = config.database.options.dialectOptions || {};
  config.database.options.dialectOptions = { ssl: { rejectUnauthorized: false } };
}

if (config.database.options.logging) {
  if (process.env.NODE_ENV === 'production') {
    config.database.options.logging = (query, executionTime) => {
      if (executionTime > 50) {
        debug(query.replace(/(\n|\t| +)/g, ' ').slice(0, 100), '|', executionTime, 'ms');
      }
    };
  } else {
    config.database.options.logging = (query, executionTime) => {
      debug(
        '\n-------------------- <query> --------------------\n',
        query,
        `\n-------------------- </query executionTime="${executionTime}"> --------------------\n`,
      );
    };
  }
}

if (config.database.options.pool) {
  if (config.database.options.pool.min) {
    config.database.options.pool.min = parseInt(config.database.options.pool.min, 10);
  }
  if (config.database.options.pool.max) {
    config.database.options.pool.max = parseInt(config.database.options.pool.max, 10);
  }
}

export const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  ...config.database.options,
});

const models = setupModels(sequelize);

export default models;

/**
 * Separate function to be able to use in scripts
 */
export function setupModels(client) {
  const m = {}; // models

  /**
   * Models.
   */

  [
    'Activity',
    'Application',
    'ConnectedAccount',
    'Collective',
    'Comment',
    'CommentReaction',
    'Conversation',
    'ConversationFollower',
    'Expense',
    'ExpenseAttachedFile',
    'ExpenseItem',
    'LegalDocument',
    'Member',
    'MemberInvitation',
    'Notification',
    'Order',
    'PaymentMethod',
    'PayoutMethod',
    'RequiredLegalDocument',
    'Session',
    'Subscription',
    'Tier',
    'Transaction',
    'Update',
    'User',
  ].forEach(model => {
    m[model] = client.import(`${__dirname}/${model}`);
  });

  /**
   * Relationships
   */

  // PaymentMethod.
  m.PaymentMethod.belongsTo(m.Collective);
  m.PaymentMethod.belongsTo(m.PaymentMethod, {
    as: 'sourcePaymentMethod',
    foreignKey: 'SourcePaymentMethodId',
  });

  // User
  m.User.hasMany(m.Activity);
  m.User.hasMany(m.Notification);
  m.User.hasMany(m.Transaction, {
    foreignKey: 'CreatedByUserId',
    as: 'transactions',
  });
  m.User.hasMany(m.Order, { foreignKey: 'CreatedByUserId', as: 'orders' });
  m.User.hasMany(m.PaymentMethod, { foreignKey: 'CreatedByUserId' });
  m.User.hasMany(m.Member, { foreignKey: 'CreatedByUserId' });
  m.User.hasMany(m.ConnectedAccount, { foreignKey: 'CreatedByUserId' });
  m.User.belongsTo(m.Collective, {
    as: 'collective',
    foreignKey: 'CollectiveId',
    constraints: false,
  });

  // Members
  m.Member.belongsTo(m.User, {
    foreignKey: 'CreatedByUserId',
    as: 'createdByUser',
  });
  m.Member.belongsTo(m.Collective, {
    foreignKey: 'MemberCollectiveId',
    as: 'memberCollective',
  });
  m.Member.belongsTo(m.Collective, {
    foreignKey: 'CollectiveId',
    as: 'collective',
  });
  m.Member.belongsTo(m.Tier);

  // Member invitations
  m.MemberInvitation.belongsTo(m.User, {
    foreignKey: 'CreatedByUserId',
    as: 'createdByUser',
  });

  m.MemberInvitation.belongsTo(m.Collective, {
    foreignKey: 'MemberCollectiveId',
    as: 'memberCollective',
  });

  m.MemberInvitation.belongsTo(m.Collective, {
    foreignKey: 'CollectiveId',
    as: 'collective',
  });

  m.MemberInvitation.belongsTo(m.Tier);

  // Activity.
  m.Activity.belongsTo(m.Collective);
  m.Activity.belongsTo(m.User);
  m.Activity.belongsTo(m.Transaction);

  // Notification.
  m.Notification.belongsTo(m.User);

  m.Notification.belongsTo(m.Collective);

  // Transaction.
  m.Collective.hasMany(m.Transaction, { foreignKey: 'CollectiveId' });
  m.Transaction.belongsTo(m.Collective, {
    foreignKey: 'CollectiveId',
    as: 'collective',
  });
  m.Transaction.belongsTo(m.Collective, {
    foreignKey: 'FromCollectiveId',
    as: 'fromCollective',
  });
  m.Transaction.belongsTo(m.Collective, {
    foreignKey: 'UsingVirtualCardFromCollectiveId',
    as: 'usingVirtualCardFromCollective',
  });

  m.Transaction.belongsTo(m.User, {
    foreignKey: 'CreatedByUserId',
    as: 'createdByUser',
  });
  m.Transaction.belongsTo(m.Collective, {
    foreignKey: 'HostCollectiveId',
    as: 'host',
  });
  m.Transaction.belongsTo(m.PaymentMethod);
  m.PaymentMethod.hasMany(m.Transaction);

  // Expense
  m.Expense.belongsTo(m.User);
  m.Expense.belongsTo(m.PayoutMethod);
  m.Expense.belongsTo(m.Collective, {
    foreignKey: 'CollectiveId',
    as: 'collective',
  });
  m.Expense.belongsTo(m.Collective, {
    foreignKey: 'FromCollectiveId',
    as: 'fromCollective',
  });
  m.Expense.hasMany(m.ExpenseAttachedFile, { as: 'attachedFiles' });
  m.Expense.hasMany(m.ExpenseItem, { as: 'items' });
  m.Expense.hasMany(m.Transaction);
  m.Transaction.belongsTo(m.Expense);
  m.Transaction.belongsTo(m.Order);

  // Expense items
  m.ExpenseItem.belongsTo(m.Expense);

  // Expense attached files
  m.ExpenseAttachedFile.belongsTo(m.Expense);

  // Order.
  m.Order.belongsTo(m.User, {
    foreignKey: 'CreatedByUserId',
    as: 'createdByUser',
  });
  m.Order.belongsTo(m.Collective, {
    foreignKey: 'FromCollectiveId',
    as: 'fromCollective',
  });
  m.Order.belongsTo(m.Collective, {
    foreignKey: 'CollectiveId',
    as: 'collective',
  });
  m.Order.belongsTo(m.Tier);
  // m.Collective.hasMany(m.Order); // makes the test `mocha test/graphql.transaction.test.js -g "insensitive" fail
  m.Collective.hasMany(m.Member, { foreignKey: 'CollectiveId', as: 'members' });
  m.Collective.hasMany(m.Order, { foreignKey: 'CollectiveId', as: 'orders' });
  m.Transaction.belongsTo(m.Order);
  m.Order.hasMany(m.Transaction);
  m.Tier.hasMany(m.Order);

  // Subscription
  m.Order.belongsTo(m.Subscription); // adds SubscriptionId to the Orders table
  m.Subscription.hasOne(m.Order);

  // PaymentMethod
  m.Order.belongsTo(m.PaymentMethod, {
    foreignKey: 'PaymentMethodId',
    as: 'paymentMethod',
  });
  m.PaymentMethod.hasMany(m.Order);
  m.Transaction.belongsTo(m.PaymentMethod);

  // Payout method
  m.PayoutMethod.belongsTo(m.User, { foreignKey: 'CreatedByUserId', as: 'createdByUser' });
  m.PayoutMethod.belongsTo(m.Collective);
  m.Collective.hasMany(m.PayoutMethod);

  // Tier
  m.Tier.belongsTo(m.Collective);

  Object.keys(m).forEach(modelName => m[modelName].associate && m[modelName].associate(m));

  return m;
}

export const Op = Sequelize.Op;
