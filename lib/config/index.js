var env = process.env.NODE_ENV || 'development',
	resolve = require('path').resolve,
	cfg={};
cfg.port=80;
cfg.public=resolve(__dirname, '../../public');
cfg.views = resolve(__dirname, '../views');
/**
 * Developer config
 */
cfg.streamApiConfig=["148981", "30fdae580286a651b644abb3a5338926"];

/**
 * Deployment config
 * 
 */
// cfg.streamApiConfig=["148831", "5f43114466f546ef598d6ee8f846c927"];
cfg.dbConnection = 'mongodb://128.199.59.208:27017/uboxie';
cfg.cookieSecret='x40gjmlgsd';
module.exports=cfg;