const express = require('express');
const axios = require('axios');
const line = require('@line/bot-sdk');

const PORT = process.env.PORT || 5000;

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const lineClient = new line.Client(lineConfig);

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const discordWebhookConfig = {
  headers: {
    'Accept': 'application/json',
    'Content-type': 'application/json',
  },
};

const generatePostData = (event, profile) => {
  const type = event.message.type;
  if (type !== 'text') {
    return {
      username: profile.displayName,
      avatar_url: `${profile.pictureUrl}.png`,
      content: 'テキスト以外のメッセージを送信しました。',
    };
  }
  return {
    username: profile.displayName,
    avatar_url: `${profile.pictureUrl}.png`,
    content: event.message.text,
  };
};

const lineBot = async (req, res) => {
  res.status(200).end(); // 'status 200'をLINEのAPIに送信

  const events = req.body.events;
  events.forEach(async (event) => {
    try {
      const profile =  await lineClient.getProfile(event.source.userId);
      const postData = await generatePostData(event, profile);
      // DiscordのWebHookにPOST
      await axios.post(discordWebhookUrl, postData, discordWebhookConfig);
    } catch(error) {
      console.error(error);
    }
  });
};

const app = express();
app.post('/linehook/', line.middleware(lineConfig), (req, res) => lineBot(req, res));
app.listen(PORT, () => console.log(`Listening on ${ PORT } for LINE Messaging API.`));
