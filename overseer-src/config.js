const configObj = require('../config.json');


module.exports = {
    getBroadcasters: () => {
        return configObj.broadcasters;
    }
};
