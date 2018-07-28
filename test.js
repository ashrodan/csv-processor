const { retreiveFile, processTasks } = require("./parseAndProcess");

function cb() { };

function script() {
    retreiveFile('csv-processor', 'demo-7111.csv', function (tasks) {
        // console.log(tasks);
        processTasks(tasks, cb);
    });

}

script();