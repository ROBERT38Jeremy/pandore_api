const fs = require('fs');
const pandoreConfFile = '../oneapp_front/config/PandoreUserConf.json';

exports.getConf = async () => {
    if (fs.existsSync(pandoreConfFile) !== true) {
        return { conf: {}, error: 'Configuration file not found' };
    }

    const pandore = await new Promise((resolve, reject) => {
        fs.readFile(pandoreConfFile, 'utf8', function (err, jsonString) {
            if (err) {
                return reject({ conf: {}, error: 'Faimed no read conf file' });
            }
            return resolve({ conf: JSON.parse(jsonString) });
        });
    })

    return pandore
}