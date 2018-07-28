const moment = require('moment-timezone');
const storage = require('@google-cloud/storage')();
const byline = require('byline');
const csv = require('csv');
const request = require('request-promise')

const CREATE_TASK_ENDPOINT = 'https://eu1-admin-api.bringg.com/services/6f15901b/c647fa2b-df87-44fc-9eb8-251215c92765/cf39f4d3-5c41-461e-b10a-15010a3bab2d/';
const INCOMING_FORMAT = 'DD/MM/YY hmm';
const TIMEZONE = 'Europe/Berlin';
const OUTGOING_FORMATING = 'DD/MM/YYYY hh:mm';

function retreiveFile(fileBucket, fileName, cb) {
    const myBucket = storage.bucket(fileBucket);

    const file = myBucket.file(fileName);
    file.download().then(function (data) {
        csv.parse(data[0], { columns: true }, function (err, data) {
            if (err) {
                throw err;
            }

            return cb(data);
        })
    })

}


function makeTaskRequest(mappedTask) {
    console.log(mappedTask);

    const options = {
        method: 'POST',
        uri: CREATE_TASK_ENDPOINT,
        body: mappedTask,
        json: true
    }

    request(options)
        .then(function (response) {
            console.log(response);
        })
        .catch(function (err) {
            console.log(err);
        })
}

function buildDateTime(date, time) {
    const dateTimeObj = moment(`${date} ${time}`, INCOMING_FORMAT, TIMEZONE);
    return dateTimeObj.utc().format(OUTGOING_FORMATING);
}

function mapTaskToRequest(task) {
    return {
        external_id: task['TRIP_ID'],
        title: `${task['VEHICLE_BOOKED_ACRISS']} for ${task['TRIP_DROP_OFF_LOCATION_NAME']}`,
        customer: {
            name: task['TRIP_DROP_OFF_LOCATION_NAME'],
            address: task['TRIP_DROP_OFF_LOCATION_STREET'],
            allow_sending_sms: true,
            allow_sending_email: false
        },
        way_points: [
            {
                customer: {
                    name: task['TRIP_PICK_UP_LOCATION_NAME'],
                    address: task['TRIP_PICK_UP_LOCATION_STREET'],
                    city: task['TRIP_PICK_UP_LOCATION_CITY'],
                    zipcode: task['TRIP_PICK_UP_LOCATION_ZIP'],
                    allow_sending_sms: true,
                    allow_sending_email: false
                },
                scheduled_at: buildDateTime(task['TRIP_PICK_UP_DATE'], task['TRIP_PICK_UP_TIME']),
                address: task['TRIP_PICK_UP_LOCATION_STREET'],
                city: task['TRIP_PICK_UP_LOCATION_CITY'],
                zipcode: task['TRIP_PICK_UP_LOCATION_ZIP'],
            },
            {
                customer: {
                    name: task['TRIP_DROP_OFF_LOCATION_NAME'],
                    address: task['TRIP_DROP_OFF_LOCATION_STREET'],
                    city: task['TRIP_DROP_OFF_LOCATION_CITY'],
                    zipcode: task['TRIP_DROP_OFF_LOCATION_ZIP'],
                    allow_sending_sms: true,
                    allow_sending_email: false
                },
                scheduled_at: buildDateTime(task['TRIP_DROP_OFF_DATE'], task['TRIP_DROP_OFF_TIME']),
                address: task['TRIP_DROP_OFF_LOCATION_STREET'],
                city: task['TRIP_DROP_OFF_LOCATION_CITY'],
                zipcode: task['TRIP_DROP_OFF_LOCATION_ZIP'],
            }]
    }
}

function processTasks(tasks, cb) {
    Promise.all(tasks.map(task => makeTaskRequest(mapTaskToRequest(task))))
        .then(function () {
            return cb();
        })
}
module.exports = {
    retreiveFile, processTasks
}