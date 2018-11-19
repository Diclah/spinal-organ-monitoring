
var spinalCore = require("spinal-core-connectorjs");

var config = require("./config");
var spinalgraph = require("spinalgraph");
var colors = require('colors');

const connect_opt =
  `http://${config.spinalConnector.user}:${
  config.spinalConnector.password
}@${config.spinalConnector.host}:${config.spinalConnector.port}/`;

var conn = spinalCore.connect(connect_opt);


spinalCore.load(conn, config.file.path , _file => {

      _file.graph.getContext(config.appName).then(async networkContext => {

        if (typeof networkContext !== "undefined") {
          var allDevices = await networkContext.getChildren([
            "hasDevice"
          ]);
          for (var i = 0; i < allDevices.length; i++) {
            displayDevice(allDevices[i]);
          }

        }
      })

}, () => {
  console.log(`
  ${config.appName} file does not exist in location ${config.file.path}`)
});



let displayDevice = async (deviceNode) => {
  var deviceElement = await deviceNode.getElement();

  var endpoints = await deviceNode.getChildren(["hasEndpoint"]);

  for (var i = 0; i < endpoints.length; i++) {
    await displayEndpoint(endpoints[i], deviceElement);
  }

}

let displayEndpoint = async (endpointNode, deviceElement) => {
  var element = await endpointNode.getElement();
  element.currentValue.bind(() => {
    // var value = element.currentValue.get();
    console.log(
      `
      Endpoint Name : ${colors.green(element.name.get())}
      path: ${colors.green(element.path.get())}
      value : ${colors.green(element.currentValue.get())}
      unit: ${colors.green(element.unit.get())}
      Parent : ${colors.green(deviceElement.name.get())}
    `
    )
  })
}


let getChildren = async (networkNode, relationName) => {
  var deviceNodes = await networkNode.getChildren([relationName]);
  return deviceNodes;
}


let getNodeElement = async (node) => {
  return await node.getElement();
}