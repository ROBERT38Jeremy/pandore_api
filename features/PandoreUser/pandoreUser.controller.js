const fs = require('fs');
const { getConf } = require("../../utils/pandoreConf")

exports.getUserConf = async (req, res) => {
    const pandoreConf = await getConf();
    if (pandoreConf?.error) {
        return res.send({ success: false, error: pandoreConf.error });
    }

    return res.send({ success: pandoreConf.conf });
}

exports.saveUserConf = async (req, res) => {
    try {
        const newConf = req.body;
        fs.writeFileSync('../pandore_front/config/PandoreUserConf.json', JSON.stringify(newConf));
        return res.send({ success: true });
    } catch (err) {
        console.error(err);
        return res.send({ error: err });
    }
}