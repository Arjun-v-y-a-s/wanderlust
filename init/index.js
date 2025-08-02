const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_URL="mongodb://127.0.0.1:27017/wonderLust";

main().then(()=>{
    console.log("connected to DB");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongo_URL);
}

const initDb = async ()=>{
   await  Listing.deleteMany({});
  /* initData.data = initData.data.map((obj)=>({
    ...obj,
    owner:"68885da92dac09cf68478ec4"
   }));*/
   await Listing.insertMany(initData.data);
   console.log("data was initialised");
}

initDb();