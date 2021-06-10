const express = require("express");
const router = express.Router();
const { spawn } = require('child_process');
const fs = require("fs");

//router.post("/predict", async (req, res) => {
exports.Prediction = async (req, res) => {
    console.log(req.body.file, "from body")
    console.log(req.body.file.filename, "from body")
    if(req.body.file) {
        var filename = `${req.body.file.fileName}.${req.body.file.type.split("/")[1]}`;
        var filenameWithPath = `./Data/Source_Images/Test_Images/${req.body.file.fileName}.${req.body.file.type.split("/")[1]}`;
        var base64Data = req.body.file.base64.replace(/^data:image\/png;base64,/,"");
        var binaryData = new Buffer(base64Data, 'base64').toString('binary');

        await fs.writeFileSync(filenameWithPath, binaryData, function(err) {
            console.log(err, "from writeup");
        })
    
        const python = spawn('dental/bin/python', ['./3_Inference/Detector.py','--is_tiny']);
        
        python.stdout.on('data', async (data) => {
            
            var exists = fs.existsSync(`./Data/Source_Images/Test_Image_Detection_Results/${filename}`);
           
            if(exists){
                res.download(`./Data/Source_Images/Test_Image_Detection_Results/${filename}`)
            }
        })
    
        python.on('close',  (code) => {
            
            if (code === 0){
                fs.unlink(`./Data/Source_Images/Test_Image_Detection_Results/${filename}`, function(err) {
                    if(err && err.code == 'ENOENT') {
                        // file doens't exist
                        console.info("File doesn't exist, won't remove it.");
                    } else if (err) {
                        // other errors, e.g. maybe we don't have enough permission
                        console.error("Error occurred while trying to remove file");
                    } else {
                        console.info(`removed`);
                    }
                });
    
                fs.unlink(`./Data/Source_Images/Test_Images/${filename}`, function(err) {
                    if(err && err.code == 'ENOENT') {
                        // file doens't exist
                        console.info("File doesn't exist, won't remove it.");
                    } else if (err) {
                        // other errors, e.g. maybe we don't have enough permission
                        console.error("Error occurred while trying to remove file");
                    } else {
                        console.info(`removed`);
                    }
                });
    
                fs.unlink(`./Data/Source_Images/Test_Image_Detection_Results/Detection_Results.csv`, function(err) {
                    if(err && err.code == 'ENOENT') {
                        // file doens't exist
                        console.info("File doesn't exist, won't remove it.");
                    } else if (err) {
                        // other errors, e.g. maybe we don't have enough permission
                        console.error("Error occurred while trying to remove file");
                    } else {
                        console.info(`removed`);
                    }
                });
               
            }    
        })

    } else {
        res.json({
            success:false,
            message: "Image not received for prediction"
        }).end();
    }
};

