const functions = require('firebase-functions');
const admin = require('firebase-admin');


const axios = require('axios');

async function getAndSaveEventsFromBovada() {
    const eventsUrl = 'https://www.bovada.lv/services/sports/event/coupon/events/A/description?lang=en';
    const axiosResult = await axios.get(eventsUrl, {
        responseType: 'arraybuffer'
    })
    const resultBuffer = Buffer.from(axiosResult.data, 'binary');

    const file = admin.storage().bucket().file('events.json');

    const result = await file.save(resultBuffer, {
        metadata: {contentType: "Application/JSON"},
        public: true,
        validation: 'md5'
    })

    console.log(result)
}

module.exports = {
    getAndSaveEventsFromBovada,
}