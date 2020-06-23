var awsIot = require('aws-iot-device-sdk');
var fs =require('fs');
let {PythonShell} = require('python-shell');

var thingName = 'Blockchain_IOT'
var clientTokenUpdate;

console.log('loading iot ....');
var thingShadows = awsIot.thingShadow({
      keyPath: './certs/372b428820-private.pem.key',
  certPath: './certs/372b428820-certificate.pem.crt',
    caPath: './certs/AmazonRootCA1.pem',
  clientId: 'client1',
  region:'ap-south-1',
  host:'a3gip5bq7vdp6-ats.iot.ap-south-1.amazonaws.com'
});

thingShadows.register(thingName, {persistentSubscribe: true}, function(){
  console.log(thingName+ ' registered')
});

thingShadows
              .on('delta',function(thingName, stateObject){
                console.log('received delta on' + thingName + ':' + 
                JSON.stringify(stateObject));

                if(stateObject.state.isDoorOpen){
                  PythonShell.run('servo-360-open.py',null, function(err){
                    if(err) throw err;
                    console.log('door opened');
                  });
                }else{
                  PythonShell.run('servo-360-close.py',null, function(err){
                    if(err) throw err;
                    console.log('door closed');

                });
              }
              thingShadows.update(thingName, {
                state: {
                  reported: stateObject.state
                }
              });

            });

module.exports.doorOpen = function(){
  console.log('Command received to open the door');
  thingShadows.update(thingName, {
    state: {
      desired: {isDoorOpen: true}
    }
  });
  PythonShell.run('servo-360-open.py',null, function(err){
    if(err) throw err;
    console.log('door opened');
  });
};

module.exports.doorClose = function(){
  console.log('Command received to close the door');
  thingShadows.update(thingName, {
    state: {
      desired: {isDoorOpen: false}
    }
  });
//   PythonShell.run('servo-360-close.py',null, function(err){
//     if(err) throw err;
//     console.log('door closed');
// });
};

