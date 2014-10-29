var env = process.env.NODE_ENV || 'development',
	resolve = require('path').resolve,
	cfg={};
cfg.port=8000;
cfg.public=resolve(__dirname, '../../public');
cfg.views = resolve(__dirname, '../views');
module.exports=cfg;