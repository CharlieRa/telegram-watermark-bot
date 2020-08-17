const request = require('request');
const TeleBot = require('telebot');
const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const config = dotenv.config();

let token;
if (!config.parsed) {
    token = process.env.token;
} else {
    token = config.parsed.token;
}

setInterval(function () {
    http.get('http://whispering-everglades-65542.herokuapp.com/');
    console.log('Log of interval');
}, 200000); // every 5 minutes (300000)

const bot = new TeleBot({
    token: token,
    polling: {
        // Optional. Use polling.
        interval: 500, // Optional. How often check updates (in ms).
        retryTimeout: 3000 // Optional. Reconnecting timeout (in ms).
    }
});
// const path = require('path')
const PORT = process.env.PORT || 5000;

express()
    // .use(express.static(path.join(__dirname, 'public')))
    // .set('views', path.join(__dirname, 'views'))
    // .set('view engine', 'ejs')
    .get('/', (req, res) => res.send(JSON.stringify({a: 1}, null, 3)))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        request(uri)
            .pipe(fs.createWriteStream(filename))
            .on('close', callback);
    });
};
// 48839

// Command keyboard
const replyMarkup = bot.keyboard([['/start']], {resize: true, once: false});

// Log every text message
bot.on('text', function (msg) {
    console.log(`[text] ${msg.chat.id} ${msg.text}`);
});

// On command "start" or "help"
bot.on(['/start', '/help'], function (msg) {
    return bot.sendMessage(
        msg.chat.id,
        'Send a image and I will add the Alien Wolf 3D Vision Watermark',
        {replyMarkup}
    );
});

bot.on('photo', msg => {
    let getFileUrl =
        'https://api.telegram.org/bot' + token + '/getFile?file_id=';

    let fileDownloadUrl =
        'https://api.telegram.org/file/bot' + token + '/';
    let id = msg.chat.id;
    bot.sendMessage(
        id,
        `Adding the Alien Wolf 3D Vision Watermark wait a few seconds...`
    );
    if (!msg.photo) {
        return;
    }
    let lastPhotoIndex = 0;
    lastPhotoIndex = msg.photo.length - 1;
    // console.log(lastPhotoIndex);
    const imageFileId = msg.photo[lastPhotoIndex].file_id;
    // console.log(imageFileId);
    getFileUrl = getFileUrl + imageFileId;
    // console.log(getFileUrl);

    request(getFileUrl, function (error, response, body) {
        if (error) {
            console.log('An Error: ', error); // Print the error if one occurred
            bot.sendMessage(id, `Error to add the watermark, try again please. #01`);
            return;
        }
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', JSON.parse(body));
        const result = JSON.parse(body);
        if (result.ok === false) {
            bot.sendMessage(
                id,
                `There is a error adding the watermark, try again please. #02`
            );
            return;
        }
        fileDownloadUrl = fileDownloadUrl + result.result.file_path;
        // console.log(fileDownloadUrl);
        const downloadedImagePath =
            './images/downloadedImage' + imageFileId + '.png';
        // console.log(downloadedImagePath);

        const watermarkedImagePath =
            './images/watermarkedImage' + imageFileId + '.png';

        const logoColor = './images/logo-tp.png';
        const logoBlackAndWhite = './images/logo-tp-bw.png';
        const logo =
            msg.from && msg.from.username == 'Fx_Hassan_elhadedy'
                ? logoColor
                : logoBlackAndWhite;

        // console.log(logo);

        download(fileDownloadUrl, downloadedImagePath, () => {
            gm(downloadedImagePath)
                .composite(logo)
                .resize(
                    msg.photo[lastPhotoIndex].width,
                    msg.photo[lastPhotoIndex].height
                )
                // .dissolve('15')
                .write(watermarkedImagePath, err => {
                    if (err) {
                        // console.log('Error on composite:', err);
                        bot.sendMessage(
                            id,
                            `There is a error adding the watermark, try again please.`
                        );
                        return;
                    }

                    promise = bot.sendPhoto(id, watermarkedImagePath, {
                        fileName: 'watermarkedImage.png'
                    });

                    promise.then(() => {
                        fs.unlinkSync(watermarkedImagePath);
                        fs.unlinkSync(downloadedImagePath);
                    });

                    return promise.catch(error => {
                        // console.log('Error send image: ', error);
                        bot.sendMessage(id, `An error ${error} occurred, try again.`);
                    });
                });
        });
    });
});

// Start getting updates
bot.start();
