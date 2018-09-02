const request = require("request");
const TeleBot = require('telebot');
// const watermark = require("image-watermark");
const gm = require("gm");
const watermark = require("dynamic-watermark");
const fs = require('fs');
const bot = new TeleBot("666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM");
const cloudinary = require("cloudinary");

const download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

let getFileUrl =
  "https://api.telegram.org/bot666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM/getFile?file_id=";

let fileDownloadUlr =
  "https://api.telegram.org/file/bot666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM/";
// Command keyboard
const replyMarkup = bot.keyboard([
    ['/start']
], { resize: true, once: false });

// Log every text message
bot.on('text', function (msg) {
    console.log(`[text] ${msg.chat.id} ${msg.text}`);
});

// On command "start" or "help"
bot.on(['/start', '/help'], function (msg) {
    return bot.sendMessage(msg.chat.id,
        'Send a image and I will add the Alien Wolf 3D Vision Watermark', { replyMarkup }
    );
});

bot.on('photo', (msg) => {
    let id = msg.chat.id;
    bot.sendMessage(id, `Adding the Alien Wolf 3D Vision Watermark wait a few seconds...`);
    console.log(msg);
    if (!msg.photo) {
        return;
    }
    getFileUrl = getFileUrl + msg.photo[2].file_id;
    console.log(getFileUrl);
    
    request(getFileUrl, function(error, response, body) {
        console.log("error:", error); // Print the error if one occurred
        console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        console.log("body:", JSON.parse(body)); // Print the HTML for the Google homepage.
        const result = JSON.parse(body);
        fileDownloadUlr = fileDownloadUlr + result.result.file_path;

        download(fileDownloadUlr, 'image.png', function () {
            console.log('done');
            
            gm("logo.jpg")
              // .watermark('50x50')
              // .blackThreshold(0, 0, 0, 10)
              //   .sepia()
              // .monochrome()
              .operator("Opacity", 'Multiply', '0.5')
              .write(
                "/home/carlos/Projects/watermark-telegram-bot/outputgm.png",
                function(err) {
                  console.log("error", err);

                  if (!err) console.log("done gm");
                  var optionsImageWatermark = {
                    type: "image",
                    source: "output.png",
                    logo: "outputgm.png",
                    destination: "output.png",
                    position: {
                      logoX: 0,
                      logoY: 0,
                      logoHeight: msg.photo[2].height,
                      logoWidth: msg.photo[2].width
                    }
                  }; // This is optional if you have provided text Watermark
                  //optionsImageWatermark or optionsTextWatermark
                  watermark.embed(optionsImageWatermark, function(
                    status
                  ) {
                    //Do what you want to do here
                    console.log(status);
                    promise = bot.sendPhoto(id, "output.png", {
                      fileName: "output.png"
                    });
                    return promise.catch(error => {
                      console.log("[error]", error);
                      // Send an error
                      bot.sendMessage(
                        id,
                        `😿 An error ${error} occurred, try again.`
                      );
                    });
                  });
                }
              );
            // const options = {
            //     'text': 'sample watermark',
            //     'color': 'rgb(154, 50, 46)'
            // };
            // watermark.embedWatermark('image.png', options);

            // promise = bot.sendPhoto(id, "watermark.png", {
            //     fileName: "watermark.png",
            // });


            // promise = bot.sendPhoto(id, "watermark.png", {
            //   fileName: "watermark.png",
            // });

            // Send "uploading photo" action
            // bot.sendAction(id, 'upload_photo');
        });
    });

});

// On command "kitty" or "kittygif"
bot.on(['/kitty', '/kittygif'], function (msg) {

    let promise;
    let id = msg.chat.id;
    let cmd = msg.text.split(' ')[0];

    // Photo or gif?
    if (cmd == '/kitty') {
        promise = bot.sendPhoto(id, API + 'jpg', {
            fileName: 'kitty.jpg',
            serverDownload: true
        });
    } else {
        promise = bot.sendDocument(id, API + 'gif#', {
            fileName: 'kitty.gif',
            serverDownload: true
        });
    }

    // Send "uploading photo" action
    bot.sendAction(id, 'upload_photo');

    return promise.catch(error => {
        console.log('[error]', error);
        // Send an error
        bot.sendMessage(id, `😿 An error ${error} occurred, try again.`);
    });

});

// Start getting updates
bot.start();