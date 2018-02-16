'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {

    var winston   = require('winston');
    var path      = require("path");
    const fs      = require('fs');
    const homeDir = require('os').homedir();

    /**
	 * Get logger configuration file
     */
	const getLoggerConf = function () {

		const conf = {};
		const transports = [];
		conf.transports = transports;
        //Add Console as default..
		transports.push(new winston.transports.Console({
            handleExceptions: true,
            json: false,
            timestamp: true
        }));

		//Add log level..
		if(packageObj.logger){
			let logPath;
			if(packageObj.logger.path){
                logPath = path.join(homeDir, packageObj.logger.path);
			}else{
                logPath = homeDir;
			}

            if(packageObj.logger.createPathIfNotPresent){
                if (!fs.existsSync(logPath)){
                    fs.mkdirSync(logPath);
                }
			}



			if(packageObj.logger.logs){
				for(const key in packageObj.logger.logs){
					if(packageObj.logger.logs.hasOwnProperty(key)){
                        let fileName;
						if(logPath){
                            fileName = path.join(logPath, packageObj.logger.logs[key].fileName);
						}else{
                            fileName = packageObj.logger.logs[key].fileName;
						}

						const name = packageObj.logger.logs[key].name;
						if(fileName){
							transports.push(
								new (winston.transports.File)({
                                    name: name,
                                	filename: fileName,
                                	level: key
                            	})
							);
						}
					}
				}
			}

			//Add exception file..
			if(packageObj.logger.handleException){
				let exceptionFileName;
                if(logPath){
                    exceptionFileName = path.join(logPath, packageObj.logger.handleException);
                }else{
                    exceptionFileName = packageObj.logger.handleException;
                }
				conf.exceptionHandlers =  [
                    new winston.transports.File({ filename:  exceptionFileName})
                ]
			}
		}
		return conf;
    };

    /**
     * Configure Winston logger
     */
    const logger = new winston.Logger(getLoggerConf());

	/**
	 * Here server is the main app object
	 * databaseObj is the mapped database from the package.json file
	 * helper object contains all the helpers methods.
	 * packegeObj contains the packageObj file of your plugin. 
	 */

	/**
	 * Initialize the plugin at time of server start.
	 * init method should never have any argument
	 * It is a constructor and is populated once the server starts.
	 * @return {[type]} [description]
	 */
	var init = function(){
		//Add Logger to server
		server.logger = logger;
        server.logger.info('Logger attached');
	};


	//return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init,
        logger: logger
	}
}; //module.exports
