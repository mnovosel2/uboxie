var env = process.env.NODE_ENV || 'development',
	resolve = require('path').resolve,
	cfg={};
cfg.port=80;
cfg.public=resolve(__dirname, '../../public');
cfg.views = resolve(__dirname, '../views');
cfg.streamApiConfig=["h2kbtzugbtghyng4p5rjxeky", "DK7z2pndpV"];
module.exports=cfg;
