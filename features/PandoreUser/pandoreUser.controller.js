const fs = require('fs');
const { getConf } = require("../../utils/pandoreConf")

exports.getUserConf = async (req, res) => {
    const pandoreConf = await getConf();
    if (pandoreConf?.error) {
        return res.send({success: false, error: pandoreConf.error});
    }

    return res.send({ success: pandoreConf.conf });
}