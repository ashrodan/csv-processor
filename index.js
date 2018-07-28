/**
 * Generic background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.processCSV = (event, callback) => {
  const file = event.data;

  console.log(`
    Event Type: ${event.eventType}
    Bucket: ${file.bucket}
    File: ${file.name}
    Metageneration: ${file.metageneration}
    Created: ${file.timeCreated}
    Updated: ${file.updated}
    `);

  const { retreiveFile, processTasks } = require("./parseAndProcess");
  retreiveFile(file.bucket, file.name, function (tasks) {
    console.log(tasks);
    processTasks(tasks, callback);
  });

};
