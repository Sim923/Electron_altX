import fs from "fs";
import { parse as jsonCSVParser } from "json2csv";
import { io } from "./local-io";
import maps from "./maps";

const formats = {
  csv: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  adept: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  yellow: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  feather: {
    loadFile: io.feather.load,
    saveFile: io.feather.save
  },
  ghost: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  kaiser: {
    loadFile: io.feather.load,
    saveFile: io.feather.save
  },
  splash: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  ganesh_footlocker: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  ganesh_offspring: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  ganesh_size: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  aiomoji: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  defJSON: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  anbaio: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  balko: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  bnb: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  candypreme: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  cinnasole: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  cyber: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  dashev3: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  eveaio: {
    loadFile: io.xml.load,
    saveFile: io.xml.save
  },
  hastey: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  kodai: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  oculus: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  pd: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  phantom: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  prism: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  profiles: {
    loadFile(fileName, cb) {
      const data = fs.readFileSync(fileName, "utf-8");
      const json = data.split(";").map(JSON.parse);
      cb(json);

      return json;
    },

    saveFile(fileName, data) {
      const raw = data.map(item => JSON.stringify(item, null, 2)).join(";");
      fs.writeFileSync(fileName, raw);
    }
  },
  sneaker_copter: {
    /* loadFile(fileName) {
      const origCSV = fs.readFileSync(fileName);
      const headers = [
        "ProfileName",
        "StateBilling",
        "Address1Shipping",
        "Address1Billing",
        "CityBilling",
        "FirstNameBilling",
        "LastNameBilling",
        "PhoneBilling",
        "ZipCodeBilling",
        "CountryBilling",
        "CardSecurityCode",
        "CardNumber",
        "CardExpirationMonth",
        "CardExpirationYear",
        "Email",
        "CountryBillingShort"
      ];
      const headerCSV = `${headers.join(",")}\n${s}`;

      const rows = [];
      csv
        .fromString(CSV_STRING, { headers: true })
        .on("data", row => rows.push(row))
        .on("end", () => {});
    }, */
    saveFile(fileName, data) {
      const fields = Object.keys(data[0]);
      const opts = { fields, quote: "", header: false };

      try {
        const csv = jsonCSVParser(data, opts);
        fs.writeFileSync(fileName, csv);
      } catch (err) {
        console.error(err);
      }
    }
  },
  sole_terminator: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  soleaio: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  whatbot: {
    loadFile: io.db.load,
    saveFile: io.db.save
  },
  yitan: {
    loadFile: io.zip.load,
    saveFile: io.zip.save
  },
  NSB: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  TKS: {
    loadFile: io.json.load,
    saveFile: io.json.save
  }
};

function convert(sourceFile, targetFile, sourceFormatName, targetFormatName) {
  if (!Object.keys(formats).includes(sourceFormatName))
    throw new Error(`Unknown format: ${sourceFormatName}`);
  if (!Object.keys(formats).includes(targetFormatName))
    throw new Error(`Unknown format: ${targetFormatName}`);
  const sourceFormat = formats[sourceFormatName];
  const targetFormat = formats[targetFormatName];
  const sourceMap = maps[sourceFormatName];
  const targetMap = maps[targetFormatName];

  sourceFormat.loadFile(sourceFile, function(sourceDataRaw) {
    const sourceData = Object.keys(sourceMap).includes("unpack")
      ? sourceMap.unpack(sourceDataRaw)
      : sourceDataRaw;
    const defaultData = sourceData.map(row =>
      maps[sourceFormatName].intoDefault(row, maps[sourceFormatName])
    );
    const resultDataRaw = defaultData.map(row =>
      maps[targetFormatName].fromDefault(row, maps[targetFormatName])
    );
    const resultData = Object.keys(targetMap).includes("pack")
      ? targetMap.pack(resultDataRaw)
      : resultDataRaw;

    targetFormat.saveFile(targetFile, resultData);
  });
}

export { convert };
