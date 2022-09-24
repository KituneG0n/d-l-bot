// Response for Uptime Robot
const http = require("http");
http
  .createServer(function (request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("DiscordBot is active Please don't close this page \n");
  })
  .listen(3000);

// Discord bot implements
const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
  // botのステータス表示
  client.user.setActivity("LINE");
  console.log("bot is ready!");
});

client.on("message", (message) => {
  // bot(自分)のメッセージには反応しない(これをしないと兵庫県警に捕まる)
  if (message.author.bot) {
    return;
  }
  // DMには応答しない
  if (message.channel.type == "dm") {
    return;
  }

  const msg = message;

  // botへのリプライは無視
  if (msg.mentions.has(client.user)) {
    return;
  } else {
    // GASにメッセージを送信
    if (msg.channel.id == process.env.CHANNEL_ID) {
      sendGAS(msg);
    }

    return;
  }

  function sendGAS(data) {
    // LINE Messaging API風の形式に仕立てる(GASでの場合分けが楽になるように)
    const jsonData = {
      events: [
        {
          type: "discord",
          name: data.author.username,
          message: data.content,
        },
      ],
    };
    // GAS URLに送る
    post(process.env.GAS_URL, jsonData);
  }

  function post(url, data) {
    // requestモジュールを使う
    const request = require("request");
    const options = {
      uri: url,
      headers: { "Content-type": "application/json" },
      json: data,
      followAllRedirects: true,
    };
    // postする
    request.post(options, function (error, response, body) {
      if (error != null) {
        msg.reply("更新に失敗しました");
        return;
      }

      const userid = response.body.userid;
      const channelid = response.body.channelid;
      const text = response.body.message;
      if (userid != undefined && channelid != undefined && text != undefined) {
        const channel = client.channels.get(channelid);
        if (channel != null) {
          channel.send(text);
        }
      }
    });
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("please set ENV: DISCORD_BOT_TOKEN");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);
