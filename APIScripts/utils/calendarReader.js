const axios = require('axios'); //simple tool for all http style requests
const { calendar } = require('googleapis/build/src/apis/calendar'); //Google apis used to build a new calendar and add events from data pulled from canvas
const process = require('process');

async function getCanvasEvents(startDate = new Date().toISOString().split('T')[0], endDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]){
    const url = `${process.env.CANVAS_URL}/api/v1/calendar_events?start_date=${startDate}&end_date=${endDate}&per_page=100`; //url used to call from
    console.log('This shit comes from: ', url)
    try {
        const response = await axios.get(url, { //awaits to ensure the axios.get has real url data
            headers: {
                'Authorization': `Bearer ${process.env.CANVAS_TOKEN}` //sets header to this CANVAS_TOKEN (check .env is using the right token)
            }
        });
        return response.data;
    } catch (error) {
        console.error('There was a problem snagging Canvas events')
        throw error
    }
}

module.exports = {getCanvasEvents} //getCanvasEvents exocytosis