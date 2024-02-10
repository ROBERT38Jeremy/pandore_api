const { getProcessList } = require("../features/ProcessList");
// let readyToListen = false;

const pandoreWebsocket = (wss) => {
	wss.on('connection', (ws) => {
        ws.on('message', () => {
            readyToListen = true;
            const sendDatas = async () => {
                const result = await getProcessList();
                ws.send(JSON.stringify(result));

                if (ws.readyState === 1 && result?.success !== false) {
                    setTimeout(sendDatas, 5000)
                }
            }
            sendDatas()
        });
    });
};

module.exports = { pandoreWebsocket };