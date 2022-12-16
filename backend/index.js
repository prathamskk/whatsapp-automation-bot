const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { parse } = require("csv-parse");
const os = require("os");
const multer = require("multer");
const upload = multer({ dest: os.tmpdir() });
require("dotenv").config();

const qrcode = require("qrcode-terminal");

const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
  // puppeteer: {
  //   //using vivaldi browser this might cause problems
  //   //bad practice hardcoded path
  //   executablePath: "D:\\Application Files\\Vivaldi\\Application\\vivaldi.exe",
  // },
});

const app = express();
app.use(cors());
//global state variables
let appState = "notready";
let globalQR = undefined;

app.get("/qr", (req, res) => {
  if (appState === "ready") {
    res.json({ errors: "Successfully Logged in", info: client.info });
  } else if (globalQR === undefined) {
    res.json({ errors: "Please Wait for  QR code to be generated" });
  } else {
    res.json({ qr: globalQR });
  }
});

app.get("/logout", async (req, res) => {
  if (appState === "ready") {
    await client.logout();
    appState = "notready";
    globalQR = undefined;
    res.json({ data: "logged out successfully" });
  } else {
    res.json({ errors: "Please Login first by generating QR code" });
  }
});

app.post("/upload_files", upload.single("file"), (req, res) => {
  if (appState === "notready") {
    return res.json({ errors: "Please Login First" });
  }
  const file = req.file;

  const data = fs.readFileSync(file.path);
  parse(data, (err, records) => {
    if (err) {
      console.error(err);
      return res
        .status(400)
        .json({ success: false, message: "An error occurred" });
    } else {
      //add all numbers in an array and convert to whatsapp serialized id
      try {
        const generatePhoneArray = () => {
          console.info(records);
          let phonenoarray = [];
          for (let index = 1; index < records.length; index++) {
            phonenoarray[index - 1] = "91" + records[index][1] + "@c.us";
          }
          console.log(phonenoarray);
          return phonenoarray;
        };

        client.getChats().then((chats) => {
          const myTestGroups = chats.filter(
            (chat) => chat.name === req.body.groupname
          );
          const myTestAnnouncement = myTestGroups.find((chat) => {
            return chat.groupMetadata.announce;
          });

          if (myTestAnnouncement === undefined) {
            return res.json({
              errors: "No Announcement Group Exists with the entered name",
            });
          } else {
            const phonenoarray = generatePhoneArray();
            for(let i=0 ;i<phonenoarray.length ; i++){

              myTestAnnouncement.addParticipants([phonenoarray[i]]);
            }
            console.log(req.body.groupname);

            return res.json({ data: "done adding numbers to announcement" });
          }
        });

        //add all whatsapp numbers to whatsapp announcement group

        // client.sendMessage(
        //   myTestAnnouncement.id._serialized,
        //   "Automated Group and message"
        // );
        // (async () => {
        //   console.info(records);
        //   let phonenoarray = [];
        //   for (let index = 1; index < records.length; index++) {
        //     phonenoarray[index - 1] = "91" + records[index][1] + "@c.us";
        //   }
        //   console.log(phonenoarray);

        //   //get announcement chat
        //   client.getChats().then((chats) => {
        //     const myTestGroups = chats.filter((chat) => chat.name === "test");
        //     const myTestAnnouncement = myTestGroups.find((chat) => {
        //       return chat.groupMetadata.announce;
        //     });
        //     // console.log(myTestAnnouncement);

        //     //add all whatsapp numbers to whatsapp announcement group
        //     myTestAnnouncement.addParticipants(phonenoarray);

        //     // client.sendMessage(
        //     //   myTestAnnouncement.id._serialized,
        //     //   "Automated Group and message"
        //     // );
        //   });

        //   // const myGroup = await client.createGroup(
        //   //   "automatic group",
        //   //   phonenoarray
        //   // );
        //   // console.log(myGroup);
        //   // console.log(myGroup.gid);
        //   // client.sendMessage(
        //   //   myGroup.gid._serialized,
        //   //   "automatic group and message"
        //   // );
        // })();
      } catch (error) {
        console.log(error);
        return res.json({ errors: error });
      }
    }
  });
});

app.listen(process.env.port, process.env.ip, () => {
  console.log(
    `Express app listening on ${process.env.ip}:${process.env.port} `
  );
});

// const processFile = async () => {
//   const records = [];
//   const parser = fs
//     .createReadStream(`C:/Users/PRATHAM/laptop-pc-sync/BIA/Whatsapp-auto/phoneno.csv`)
//     .pipe(parse({
//       // CSV options if any
//     }));
//   for await (const record of parser) {
//     // Work with each record
//     records.push(record);
//   }
//   return records;
// };

client.on("qr", (qr) => {
  globalQR = qr;
  console.log("qr generated");
  // qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log(client.info);
  appState = "ready";
  console.log("Whatsapp Client is ready!");

  // let groupArray = [];
  //   for (let i = 0; i < 5; i++) {
  //     groupArray[i] = client.createGroup("automatic group" + i , ["918108980846@c.us"]);
  //     console.log(groupArray);
  //     groupArray[i].then((response)=>client.sendMessage(response.gid._serialized , "Automated Group and message") )
  //     // client.sendMessage(groupArray[i].gid , "Automated Group and message");

  //   }

  // (async () => {
  //   const records = await processFile();
  //   console.info(records);
  //   let phonenoarray = []
  //   for (let index = 1; index < records.length; index++) {
  //     phonenoarray[index-1] = "91"+records[index][1]+"@c.us";

  //   }
  //   console.log(phonenoarray);
  //   const myGroup = await client.createGroup("automatic group" , phonenoarray)
  //   console.log(myGroup);
  //   console.log(myGroup.gid);
  //   client.sendMessage(myGroup.gid._serialized,"automatic group and message")
  // })();

  // client.getChats().then((chats) => {
  //   const myGroup = chats.find((chat) => chat.name === "self");

  //   // console.log(myGroup)
  //   client.on("message", (message) => {
  //     console.log(message);
  //     if (message.body === "!ping") {
  //       message.reply("pong");
  //     }

  //     if (message.from === myGroup.id._serialized) {
  //       client.sendMessage(myGroup.id._serialized, "Automated message");
  //     }

  //     if (message.from === "919833211515@c.us") {
  //       console.log("reached here");
  //       message.reply("Automated Reply");
  //     }
  //   });
  // });
});

client.on("disconnected", (reason) => {
  console.log(reason);
  // Destroy and reinitialize the client when disconnected
  console.log("destroying client");
  client.destroy();
  console.log("reinitializing client started");
  client.initialize();
  console.log("reinitializing client finished");
});

client.initialize();
