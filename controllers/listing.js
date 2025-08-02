const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req,res)=>{
  let {category} = req.query;
  let allListings
  if(!category || category=='trending'){
    
    allListings= await Listing.find({});
   return res.render("listings/index.ejs",{allListings});
  }else{
      allListings = await Listing.find({category:category});
      res.render("listings/filter.ejs",{allListings});
  }
  
  
  };

module.exports.listingSearch = async(req,res)=>{
  let {location} = req.query;
   let allListings = await Listing.find({location: { $regex: location, $options: "i" }});

   if(allListings.length === 0){
    req.flash("error","srry can't found listing with this location!");
    return res.redirect("/listings");
   }
 res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
     res.render("listings/new.ejs");
  };
  
module.exports.showListing =async (req,res)=>{
    let {id} = req.params;
    const listing =await Listing.findById(id).populate({path :"reviews",populate :{path:"author"}}).populate("owner");
    if(!listing){
      req.flash("error","Listing does not exist");
      return res.redirect("/listings");
    }
  res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async(req,res,next)=>{ 
  let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send();
 let listCategory =req.body.category;
  let url = req.file.path;
  let filename = req.file.filename;
 const newListing=  new Listing(req.body.listing);

 newListing.category = listCategory;
 newListing.owner = req.user._id;
 newListing.image ={url,filename};
 newListing.geometry = response.body.features[0].geometry;
   let savedListing = await newListing.save();
   console.log(savedListing);
   req.flash("success","New Listing Created");
   res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=>{
    let {id}= req.params;
     const listing =await Listing.findById(id);
       if(!listing){
      req.flash("error","Listing does not exist");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl =  originalImageUrl.replace("/upload","/upload/,w_250");

    res.render("listings/edit.ejs",{listing ,originalImageUrl});
};

module.exports.updateListing = async (req,res)=>{
     let {id}=req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
     
  if(typeof req.file !== "undefined"){  
    let url = req.file.path;
     let filename = req.file.filename;
      listing.image = {url,filename};
    await listing.save();
  }

     req.flash("success"," Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id}=req.params;
  const deletedListing =  await Listing.findByIdAndDelete(id);
   req.flash("success","Listing Deleted!");
  console.log(deletedListing);
    res.redirect("/listings");
};