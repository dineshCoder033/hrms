const crypto = require('crypto');

/**
 * Enterprise Cloud Storage Service
 * Supports:
 * 1. Cloudinary (Direct HTTP REST API - zero extra native dependencies)
 * 2. Local Fallback (Base64 data URL)
 */
const uploadToCloudStorage = async (fileBuffer, { folder = 'hrms_uploads', filename, mimetype }) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // If Cloudinary keys are present, upload directly to Cloudinary CDN
  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const publicId = `${folder}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

      // Generate Cloudinary SHA1 signature
      const signatureString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      const formData = new FormData();
      const base64File = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
      formData.append('file', base64File);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('public_id', publicId);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.secure_url) {
        return {
          fileUrl: data.secure_url,
          storageProvider: 'Cloudinary',
          publicId: data.public_id
        };
      }
      console.warn('⚠️ Cloudinary upload response not OK. Falling back to local storage.');
    } catch (err) {
      console.error('⚠️ Cloudinary upload error:', err.message);
    }
  }

  // Fallback storage: Lightweight Data URL / Local Buffer
  const base64 = fileBuffer.toString('base64');
  return {
    fileUrl: `data:${mimetype};base64,${base64}`,
    storageProvider: 'LocalMemory'
  };
};

module.exports = { uploadToCloudStorage };

