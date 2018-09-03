const request = require('request');
const TeleBot = require('telebot');
const gm = require('gm').subClass({ imageMagick: true });
const fs = require('fs');
const bot = new TeleBot('666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM');

const download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};

let getFileUrl =
  'https://api.telegram.org/bot666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM/getFile?file_id=';

let fileDownloadUlr =
  'https://api.telegram.org/file/bot666293876:AAGOH_Lw2x7QFGHwCqgG8fsm466sUeysoVM/';
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
    fileDownloadUlr = fileDownloadUlr + result.result.file_path;

    download(fileDownloadUlr, './images/downloadedImage.jpg', function() {
      console.log('done');

      gm('./images/downloadedImage.jpg')
        .composite('./images/logo.jpg')
        .dissolve('90%')
        .write('./images/watermarkedImage.jpg', function(err) {
          console.log('error', err);

          if (!err) console.log('done gm');
          promise = bot.sendPhoto(id, 'watermarkedImage.jpg', {
            fileName: 'images/watermarkedImage.jpg'
          });
          return promise.catch(error => {
            console.log('[error]', error);
            // Send an error
            bot.sendMessage(id, `An error ${error} occurred, try again.`);
          });
        });
    });
  });
});

// Start getting updates
bot.start();
