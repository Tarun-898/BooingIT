const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust',
      allowed_format: async (req, file) => ["png","jpg","jpeg"], // supports promises as well
    //   public_id: (req, file) => 'computed-filename-using-request',
    },
  });

module.exports={
    cloudinary,
    storage,
};
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');


// cloudinary.config({
//     cloud_name:"dggntj69z",
//     api_key:"465565667873559",
//     api_secret:"ttIyqcN0eOGV15bmqiEnnwS9kNk"
// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: 'wanderlust',
//       allowerdformat: async (req, file) => ["png","jpg","jpeg"], // supports promises as well
//     //   public_id: (req, file) => 'computed-filename-using-request',
//     },
//   });

// module.exports={
//     cloudinary,
//     storage,
// };
