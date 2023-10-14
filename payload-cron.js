module.exports = function (RED) {
    // This function is an entry point for the Node-RED node module.

    function PayloadCron(config) {
        // Constructor function for the node, called when a new node instance is created.
        var CronJob = require('cron').CronJob;
        var parser = require('cron-parser');
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function (msg) {
            // This is an event handler that runs whenever the node receives an input message.

            // Extract the cron expression from the input message payload
            var cronExpression = msg.payload;

            try {
                // Attempt to parse the provided cron expression
                parser.parseExpression(cronExpression);

                // Create a CronJob instance with the extracted cron expression
                var job = new CronJob(cronExpression, function () {
                    // This function is executed each time the scheduled task is triggered.

                    // Set the node's status to indicate that the job has started
                    node.status({ fill: "green", shape: "dot", text: "Job started" });

                    // Create a message with the current timestamp and send it
                    var newMsg = { payload: Date.now() };
                    node.send(newMsg);

                    // Clear the node's status
                    node.status({});
                });

                // Define behavior when the node is closed or removed from the flow
                node.on('close', function (done) {
                    // This event handler is called when the node is being closed.

                    // Set the node's status to indicate that the job has stopped
                    node.status({ fill: "red", shape: "dot", text: "Job stopped" });

                    // Stop the CronJob
                    job.stop();

                    // Call the 'done' callback to signal that the closure is complete
                    done();
                });

                // Set the initial status of the node to indicate that the job is deployed
                node.status({ fill: "blue", shape: "dot", text: `${cronExpression} - Job deployed` });

                // Delay clearing the status after a short time (500 milliseconds)
                // setTimeout(function () {
                //     node.status({});
                // }, 50000);

                // Start the CronJob to begin scheduling the tasks
                job.start();
            } catch (err) {
                // Handle errors if the cron expression is invalid
                node.error("Invalid Expression");
            }
        });
    }

    RED.nodes.registerType("payload-cron", PayloadCron);
};
