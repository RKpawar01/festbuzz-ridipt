const { uploadToS3, getUserPresignedUrls } = require('../../utils/s3utils.js');

const uploadImage = async (req, res) => {
  const files = req.files;
  const userId = req.user;
  const images_name = JSON.parse(req.body.images_name);

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  if (!userId || !images_name) {
    return res.status(400).json({ message: "User ID and image names are required." });
  }

  try {
    const uploadPromises = files.map((file, index) => {
      const name = images_name[index] || '';
      return uploadToS3(file, userId, name).then(({ key, error }) => {
        if (error) {
          throw new Error("Error uploading to S3");
        }
        return { name, key };
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    return res.status(201).json({ images: uploadedImages });
  } catch (error) {
    console.error("Error uploading images:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPresignedUrls = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(400).json({ message: "Missing x-user-id header" });
    }

    const { error, presignedUrls } = await getUserPresignedUrls(userId);
    if (error) {
      return res.status(500).json({ message: error });
    }

    return res.json({ presignedUrls });
  } catch (error) {
    console.error("Error getting presigned URLs:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const editImages = async (req, res) => {
  const files = req.files;  
  const keys = JSON.parse(req.body.keys); 
  const userId = req.user;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  if (!keys || keys.length !== files.length) {
    return res.status(400).json({ message: 'Keys must match the number of uploaded files.' });
  }

  try {
  
    const updatePromises = files.map((file, index) => {
      const key = keys[index];
      return uploadToS3(file, userId, key);
    });

    const updatedImages = await Promise.all(updatePromises);

    const errors = updatedImages.filter(image => image.error);
    if (errors.length > 0) {
      return res.status(500).json({
        message: 'Error updating some images.',
        errors,
      });
    }

    res.status(200).json({
      message: 'Images updated successfully',
      updatedImages,
    });
  } catch (error) {
    console.error('Error updating images:', error.message);
    res.status(500).json({ message: 'Error updating images', error: error.message });
  }
};

module.exports = { uploadImage, getPresignedUrls, editImages };