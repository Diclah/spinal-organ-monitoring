let organType = typeof window === "undefined" ? global : window;

var Q = require("q");

var spinalCore = require("spinal-core-connectorjs");

var config = require("./config");
var spinalgraph = require("spinalgraph");

const connect_opt = `http://${config.spinalConnector.user}:${
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

spinalCore.load(conn, config.file.path, _file => {
  wait_for_endround(_file).then(async () => {
      try {
        _file.graph.getContext(config.appName).then(async networkContext => {

          if(typeof networkContext !== "undefined") {
            var allDevices = await networkContext.getChildren(["hasDevice"]);
            for(var i = 0; i < allDevices.length; i++) {
              await monitorDevice(allDevices[i]);
            }

          }
        })
      } catch (error) {
        console.log(error);
      }
  });
});




let monitorDevice = async (device) => {
  var endpoints = await device.getChildren(["hasEndpoint"]);
  for (let i = 0; i < endpoints.length; i++) {
    let element = await endpoints[i].getElement();
    element.currentValue.bind(() => {
      console.log(`${element.name.get()} has changed, its current value is ${element.currentValue.get()}`);
    })
    
  }

}




let getChildren = async (networkNode, relationName) => {
    var deviceNodes = await networkNode.getChildren([relationName]);
    return deviceNodes;
}


let getNodeElement = async (node) => {
  return await node.getElement();
}