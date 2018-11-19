let organType = typeof window === "undefined" ? global : window;

var Q = require("q");

var spinalCore = require("spinal-core-connectorjs");

var config = require("./config");
var spinalgraph = require("spinalgraph");
var colors = require('colors');

const connect_opt =
  `http://${config.spinalConnector.user}:${
  config.spinalConnector.password
}@${config.spinalConnector.host}:${config.spinalConnector.port}/`;

var conn = spinalCore.connect(connect_opt);

let wait_for_endround = file => {
  let deferred = Q.defer();
  return wait_for_endround_loop(file, deferred);
};

let wait_for_endround_loop = (_file, defer) => {
  if (organType.FileSystem._sig_server === false) {
    setTimeout(() => {
      defer.resolve(wait_for_endround_loop(_file, defer));
    }, 100);
  } else defer.resolve(_file);
  return defer.promise;
};


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