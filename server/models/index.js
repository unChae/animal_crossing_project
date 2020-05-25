'use strict';

const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Board = require('./board')(sequelize, Sequelize);
db.Blacklist = require('./blacklist')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.Chat = require('./chat')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);
db.Item = require('./item')(sequelize, Sequelize);
db.Likehate = require('./likehate')(sequelize, Sequelize);
db.Report = require('./report')(sequelize, Sequelize);
db.Review = require('./review')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);

db.Blacklist.belongsTo(db.User, {foreignKey: 'bl_attacker_us_id', targetKey: 'us_id'});
db.Blacklist.belongsTo(db.User, {foreignKey: 'bl_victim_us_id', targetKey: 'us_id'});

db.Board.belongsTo(db.User, {foreignKey: 'bo_us_id', targetKey: 'us_id'});
db.Board.belongsTo(db.Category, {foreignKey: 'bo_category', targetKey: 'ca_id'});

db.Chat.belongsTo(db.User, {foreignKey: 'ch_send_us_id', targetKey: 'us_id'});
db.Chat.belongsTo(db.User, {foreignKey: 'ch_receive_us_id', targetKey: 'us_id'});
db.Chat.belongsTo(db.Board, {foreignKey: 'ch_bo_id', targetKey: 'bo_id'});

db.Image.belongsTo(db.Board, {foreignKey: 'im_bo_id', targetKey: 'bo_id'});

db.Likehate.belongsTo(db.User, {foreignKey: 'lh_us_id', targetKey: 'us_id'});
db.Likehate.belongsTo(db.Board, {foreignKey: 'lh_bo_id', targetKey: 'bo_id'});

db.Report.belongsTo(db.User, {foreignKey: 're_us_id', targetKey: 'us_id'});

db.Review.belongsTo(db.User, {foreignKey: 'rv_us_id', targetKey: 'us_id'});
db.Review.belongsTo(db.Board, {foreignKey: 'rv_bo_id', targetKey: 'bo_id'});

module.exports = db;
