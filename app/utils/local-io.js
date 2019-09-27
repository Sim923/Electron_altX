import fs from "fs";
import path from 'path';
import JSZip from "jszip";
import csv from "fast-csv";
import unzipper from "unzipper";
import xml2js from "xml2js";
import { parse as jsonCSVParser } from "json2csv";
import { app } from 'electron';

const xmlParser = new xml2js.Parser({ attrkey: "ATTR" }).parseString;

const io = {
  csv: {
    load(fileName, cb) {
      const rows = [];
      fs.createReadStream(fileName)
        .pipe(csv.parse({ headers: true }))
        .on("data", row => rows.push(row))
        .on("end", () => cb(rows));
    },

    save(fileName, data) {
      const fields = Object.keys(data[0]);
      const opts = { fields, quote: "" };

      try {
        const csvData = jsonCSVParser(data, opts);
        const filename = fileName.split(path.sep).pop();
        fs.writeFileSync(path.join(app.getPath('appData'), `${filename.split(".")[0]}.csv`), csvData);
      } catch (err) {
        console.error(err);
      }
    }
  },

  json: {
    load(fileName, cb) {
      const data = fs.readFileSync(fileName);
      const json = JSON.parse(data);

      cb(json);

      return json;
    },

    save(fileName, data) {
      const json = JSON.stringify(data, null, 2);
      const filename = fileName.split(path.sep).pop();
      fs.writeFileSync(path.join(app.getPath('appData'), `${filename.split(".")[0]}.json`), json);
    }
  },

  feather: {
    load(fileName, cb) {
      const data = fs.readFileSync(fileName);
      const json = JSON.parse(`[${data.toString().replace(/(\r\n|\n|\r)/gm, "")}]`);

      cb(json);

      return json;
    },

    save(fileName, data) {
      const feather = `${JSON.stringify(data[0])}\n`;
      const filename = fileName.split(path.sep).pop();
      fs.writeFileSync(path.join(app.getPath('appData'), `${filename.split(".")[0]}.json`), feather);
    }
  },

  db: {
    load(fileName, cb) {
      const s = fs.readFileSync(fileName, "utf-8");
      const lines = s.split("\n");
      const json = lines.map(JSON.parse);
      cb(json);
    },

    save(fileName, data) {
      const json = data.map(JSON.stringify).join("\n");
      const filename = fileName.split(path.sep).pop();
      fs.writeFileSync(path.join(app.getPath('appData'), `${filename.split(".")[0]}.json`), json);
    }
  },

  xml: {
    load(fileName, cb) {
      const string = fs.readFileSync(fileName, "utf8");

      xmlParser(string, function(error, result) {
        if (error === null) {
          cb(result);
        } else {
          throw new Error(`LOAD XML ${fileName} error: ${error}`);
        }
      });
    },
    save(fileName, data) {
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(data);
      const filename = fileName.split(path.sep).pop();
      fs.writeFileSync(path.join(app.getPath('appData'), `${filename.split(".")[0]}.xml`), xml);
    }
  },
  zip: {
    load(fileName, cb) {
      const items = [];
      fs.createReadStream(fileName)
        .pipe(unzipper.Parse())
        .on("entry", function(entry) {
          if (entry.path.match(/\.json$/)) {
            let s = "";
            entry
              .on("data", (chunk) => {
                s += chunk;
              })
              .on("end", () => {
                items.push(JSON.parse(s));
              });
          } else {
            entry.autodrain();
          }
        })
        .on("close", () => cb(items));
    },
    save(fileName, data) {
      const zip = new JSZip();

      function makeid(length) {
        let result = "";
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      }

      data.map(item =>
        zip.file(`${makeid(9)}.json`, JSON.stringify(item, null, 2))
      );

      const filename = fileName.split(path.sep).pop();
      zip
        .generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(fs.createWriteStream(path.join(app.getPath('appData'),`${filename.split(".")[0]}.zip`)))
        .on("finish", function() {
          // console.log(fileName + " written.");
        });
    }
  }
};

export { io };
