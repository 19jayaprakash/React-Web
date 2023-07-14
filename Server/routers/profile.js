// register the user

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const normalizeURL = require("normalize-url");
const userModel = require("../models/user");
const profileModel = require("../models/profile");
const {check, validationResult} = require("express-validator");

//@route : /profile
// @method : get
//@access : public
//@description : used for testing purpose. share the deatils of all.
// router.get("", (req, res) => {
//   res.json({ msg: "hello from profile" });
// });


// @endpoint : /profile
// @method : post
// @description : create profile
router.post("/",
check("status","status is required").notEmpty(),
 check("skills","skills is required").notEmpty(),
 auth,
async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // destructure the request
  const {
    website,
    skills,
    youtube,
    twitter,
    facebook,
    instagram,
    linkedin,
    // spread the rest of the fields we don't need to check
    ...rest
    } = req.body;

    const profileFields = {
     // user:'',
      website:website&&website!=="" ? normalizeURL(website,{forceHttps:true}):"",
      skills:Array.isArray(skills) ? skills :skills.split(",").map((s)=>"" + s.trim()),
    ...rest,
  };

  const socialFields = {
    youtube,
    twitter,
    facebook,
    instagram,
    linkedin
  }

  for(const[key,value] of Object.entries(socialFields)){
    socialFields[key] = normalizeURL(value,{forceHttps:true});
  }

  profileFields.social = socialFields;

  try {
    // Using upsert option (creates new doc if no match is found):
    let profile = await profileModel.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }

});

//  @endpoint : / profile
// method
router.get("/", async (req, res) => {
  try{
    const profiles = await profileModel.find();
    res.json(profiles);
  }
  catch(err) {
  }
});

// @endpoint : /me
// @method : get
// @description : get all profile
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await profileModel.findOne({
    user:req.user.id,
  })
  .populate("user",["name"]);
  if(!profile){
    return res.status(400).json({msg:"There is no profile for the user."});
  }
  res.json(profile);
  } catch (error) {
    res.status(500).json({msg:"server error "+ error.message});
  }
});

// @endpoint : /profile/users/:userId
// @method : get
//  @description : get specific user profile
router.get("/user/:userID", ({params : {userID}},res) => {
    res.json({userID});
});

// @endpoint : /profile/
// method :delete 
router.delete("/", auth , async (req, res) => {
  try{
    await Promise.all([profileModel.findOneAndRemove({user : req.user.id}),
    userModel.findOneAndRemove({_id : req.user.id})]);
    res.json({msg:"profile deleted successfully"});
  }
  catch(err){
    res.status(500).send("server error");
  }
});


// @endpoint : /profile/experience
// @method : put
router.put("/experience", 
  auth,
  check("title", "title is required").notEmpty(),
  check("company", "company is required").notEmpty(),
  check("from", "from date is required and needs to be from the past").notEmpty()
  .custom((value,{req})=>(req.body.to ? value<req.body.to : true)),
  async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const profile = await profileModel.findOne({user:req.user.id});
      profile.experience.unshift(req.body);
      await profile.save();
      res.json(profile);
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
});

// @endpoint : /profile/experience/:expID
// @method : delete
// @description : delete on the basis of id
router.delete("/experience/:expId",auth,async(req,res) => {
    try{
      const foundProfile =await profileModel.findOne({user:req.user.id});
      foundProfile.experience = foundProfile.experience.filter(exp=>exp._id.toString()!==req.params.expId);
      await foundProfile.save();
      return res.json(foundProfile);
    }
    catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
});

// @endpoint : /profile/education
// @method:put
// @description : put on the basis of education
router.put("/education",auth,
  check("school", "school is required").notEmpty(),
  check("degree", "degree is required").notEmpty(),
  check("fieldofstudy", "fieldofstudy is required").notEmpty(),
  check("from", "from date is required and needs to be from the past").notEmpty()
  .custom((value,{req})=>(req.body.to ? value<req.body.to : true)),
  async (req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try{
      const profile = await profileModel.findOne({user:req.user.id});
      profile.education.unshift(req.body);
      await profile.save();
      res.json(profile);
    }
    catch(err){
          console.error(err.message);
          res.status(500).send("server error");
    }
  });

// @endpoint : /profile/education/:eduId
// @method : delete
// @description : delete on the basis of education id
router.delete("/education/:eduId",auth,async (req,res) => {
  try{
    const foundProfile =await profileModel.findOne({user:req.user.id});
    foundProfile.education = foundProfile.education.filter(edu=>edu._id.toString()!==req.params.eduId);
    await foundProfile.save();
    return res.json(foundProfile);
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
