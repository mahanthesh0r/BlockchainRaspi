"use strict";
const AWS = require('aws-sdk');
const Zbar = require('zbar');
const speaker = require('./speaker'); 
const verifier = require("./verifyRentee");  
AWS.config.update({region:'ap-south-1'}); 
const rekognition = new AWS.Rekognition(); 
const sns = new AWS.SNS(); 
const s3 = new AWS.S3(); 
const PythonShell = require('python-shell'); 
const zbar = new Zbar('/dev/video1'); // connected to USB Webcam not Pi Cam 
const smartLock = require('./aws-iot'); 
const myip = require('quick-local-ip');



console.log('scan your qr code');
zbar.stdout.on('data', function(buf){
    console.log('data scanned: ' + buf.toString());
    try{
        var code = JSON.parse(buf.toString());
        // coneole.log("Required data", code.id)
        // console.log("required from", code.from)
        var houseID = code.id;
        var renteeAddress = code.from
        console.log("QR CODE", houseID)
        console.log("QR CODE", renteeAddress)
        
        verifier.verify(houseID,renteeAddress, function(err, data){

            if(!err){ 
                if(data){ 
                    speaker.speak('Your ownership is verified successfully. Door will open now. '+ 
                    'You are being watched for security reasons.'); 
                    console.log('+++++++++++++++++++++++++++++++++++++++++++++'); 
                    console.log('Congratulations ! Your ownership is verified.'); 
                    console.log('+++++++++++++++++++++++++++++++++++++++++++++'); 
                    setTimeout(function(){ 
                        smartLock.doorOpen(); 

                        setTimeout(function(){ 
                            smartLock.doorClose(); 
                        },1000*60*2) 
                    },10000)

                    sns.publish({ 
                        Message: 'Buyer has opened your Door. http://'+myip.getLocalIP4()+':8081' , 
                        TopicArn: 'arn:aws:sns:ap-south-1:528435840072:Blockchain_IOT' }, 
                        function (err, data) { 
                            if(err){ 

                            }else{ 

                            } 
                        
                        }); 
                    }else{ 
                        speaker.speak('You are not a verified buyer. '+ 
                        ' Details are sent to seller for futher action.'); 
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++'); 
                        console.log('You are not a verified buyer.');
                        console.log('+++++++++++++++++++++++++++++++++++++++++++++'); 
                        sns.publish({ Message: 'Someone trying to open your house door. http://'+myip.getLocalIP4()+':8081' , 
                        TopicArn: 'arn:aws:sns:ap-south-1:528435840072:Blockchain_IOT' 
                    }, function (err, data) { 
                        if(err){ 

                        }else{ 
                            
                        } 

                    }); 
                } 
            } 
        }) 
    
    }
    catch(error) { 
        speaker.speak('You tried to scan invalid QR Code'); 
    } 
}); 
//to run the program execute 
//RPC_URL="https://foolish-panther-48.serverless.social" node . 
zbar.stderr.on('data', function(buf) { 
    console.log(buf.toString()); 
});