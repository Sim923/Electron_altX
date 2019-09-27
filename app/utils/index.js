const path = require("path");

export const billingFileFormats = [
  { name: "CSV", format: "csv" },
  { name: "Adept", format: "adept" },
  { name: "Code Yellow", format: "yellow" },
  { name: "F3ather", format: "feather" },
  { name: "Ghost", format: "ghost" },
  { name: "Kaiser", format: "kaiser" },
  { name: "SplashForce", format: "splash" },
  { name: "Ganesh (Footlocker)", format: "ganesh_footlocker" },
  { name: "Ganesh (Offspring)", format: "ganesh_offspring" },
  { name: "Ganesh (Size)", format: "ganesh_size" },
  { name: "Aiomoji", format: "aiomoji" },
  { name: "Another Nike Bot", format: "anbaio" },
  { name: "Balkobot", format: "balko" },
  { name: "Better Nike Bot", format: "bnb" },
  { name: "Candypreme", format: "candypreme" },
  { name: "Cinnasole", format: "cinnasole" },
  { name: "Cybersole", format: "cyber" },
  { name: "Dashe", format: "dashev3" },
  { name: "Eve AIO", format: "eveaio" },
  { name: "Hastey", format: "hastey" },
  { name: "Jigtool", format: "hastey" },
  { name: "Kodai", format: "kodai" },
  { name: "NSB", format: "NSB" },
  { name: "Oculus AIO", format: "oculus" },
  { name: "Phantom", format: "phantom" },
  { name: "Prism AIO", format: "prism" },
  { name: "Project Destroyer (PD)", format: "pd" },
  { name: "Sneaker_Copter", format: "sneaker_copter" },
  { name: "Sole AIO", format: "soleaio" },
  { name: "Sole_Terminator", format: "sole_terminator" },
  { name: "TheKickStation (TKS)", format: "TKS" },
  { name: "What Bot", format: "whatbot" },
  { name: "Yitian", format: "yitan" }
];

export const socketUrl = "ws://18.205.191.187:3001";
// export const socketUrl = "ws://127.0.0.1:3003";

export const basicURL =
  process.env.NODE_ENV === "development"
    ? "bin"
    : path.join(process.resourcesPath, "bin");
