const request = require('request');
const TeleBot = require('telebot');
const gm = require('gm').subClass({ imageMagick: true });
const fs = require('fs');
const bot = new TeleBot('666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM');
const express = require('express');
// const path = require('path')
const PORT = process.env.PORT || 5000;

express()
  // .use(express.static(path.join(__dirname, 'public')))
  // .set('views', path.join(__dirname, 'views'))
  // .set('view engine', 'ejs')
  .get('/', (req, res) => res.send(JSON.stringify({ a: 1 }, null, 3)))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};

// Command keyboard
const replyMarkup = bot.keyboard([['/start']], { resize: true, once: false });

// Log every text message
bot.on('text', function(msg) {
  console.log(`[text] ${msg.chat.id} ${msg.text}`);
});

// On command "start" or "help"
bot.on(['/start', '/help'], function(msg) {
  return bot.sendMessage(
    msg.chat.id,
    'Send a image and I will add the Alien Wolf 3D Vision Watermark',
    { replyMarkup }
  );
});

bot.on('photo', msg => {
  let getFileUrl =
    'https://api.telegram.org/bot666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM/getFile?file_id=';

  let fileDownloadUrl =
    'https://api.telegram.org/file/bot666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM/';
  let id = msg.chat.id;
  bot.sendMessage(
    id,
    `Adding the Alien Wolf 3D Vision Watermark wait a few seconds...`
  );
  console.log(msg);
  if (!msg.photo) {
    return;
  }
  getFileUrl = getFileUrl + msg.photo[2].file_id;
  console.log(getFileUrl);

  request(getFileUrl, function(error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.
    const result = JSON.parse(body);
    if (result.ok === false) {
      return bot.sendMessage(
        id,
        `There is a error adding the watermark, try again please.`
      );
    }
    fileDownloadUrl = fileDownloadUrl + result.result.file_path;
    console.log(fileDownloadUrl);

    download(fileDownloadUrl, './images/downloadedImage.png', function() {
      console.log('done');

      gm('./images/downloadedImage.png')
        // .monochrome()
        .composite('./images/logo.jpg')
        .resize(msg.photo[2].width, msg.photo[2].height)
        .dissolve('15')
        .write('./images/watermarkedImage.png', function(err) {
          console.log('error', err);

          if (!err) console.log('done gm');
          promise = bot.sendPhoto(id, './images/watermarkedImage.png', {
            fileName: 'watermarkedImage.png'
          });
          return promise.catch(error => {
            console.log(error);
            // Send an error
            bot.sendMessage(id, `An error ${error} occurred, try again.`);
          });
        });
    });
  });
});

// Start getting updates
bot.start();
