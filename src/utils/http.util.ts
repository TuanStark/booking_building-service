import FormData from 'form-data'; // Use default import
import axios from 'axios';

// Helper function để sửa URL nếu có upload_service (sai) thành upload-service (đúng)
function fixUploadServiceUrl(url: string | undefined): string {
  if (!url) {
    return 'http://upload-service:3009/api';
  }
  if (url.includes('upload_service')) {
    const fixedUrl = url.replace('upload_service', 'upload-service');
    console.warn(`⚠️ [Upload Service] Detected incorrect service name 'upload_service', auto-fixing to 'upload-service'`);
    console.warn(`⚠️ Please update .env file: UPLOAD_SERVICE_URL=${fixedUrl}`);
    return fixedUrl;
  }
  return url;
}

export async function uploadImageToService(
  file: Express.Multer.File,
): Promise<any> {
  let uploadServiceUrl = process.env.UPLOAD_SERVICE_URL;
  uploadServiceUrl = fixUploadServiceUrl(uploadServiceUrl);
  const uploadUrl = `${uploadServiceUrl}/upload`;
  
  console.log('🔗 [Building Service] Connecting to Upload Service...');
  console.log(`📡 UPLOAD_SERVICE_URL: ${uploadServiceUrl}`);
  console.log(`🌐 Full upload URL: ${uploadUrl}`);
  console.log(`📁 File name: ${file.originalname}, Size: ${file.size} bytes`);

  const formData = new FormData(); // Now works with default import
  formData.append('file', file.buffer, file.originalname);

  try {
    console.log('⏳ Sending request to upload service...');
    const res = await axios.post(
      uploadUrl,
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        },
      },
    );
    console.log('✅ [Building Service] Successfully connected and uploaded to Upload Service');
    console.log(`📤 Response status: ${res.status}`);
    // Chuẩn hoá key theo BuildingService (imageUrl, imagePublicId)
    return {
      imageUrl: res.data.secure_url || res.data.url,
      imagePublicId: res.data.public_id,
    };
  } catch (error) {
    console.error('❌ [Building Service] Failed to connect to Upload Service');
    console.error(`🚨 Error details: ${error.message}`);
    if (error.response) {
      console.error(`📊 Response status: ${error.response.status}`);
      console.error(`📋 Response data:`, error.response.data);
    }
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

export async function deleteImageToService(publicId: string): Promise<string> {
  let uploadServiceUrl = process.env.UPLOAD_SERVICE_URL;
  uploadServiceUrl = fixUploadServiceUrl(uploadServiceUrl);
  const deleteUrl = `${uploadServiceUrl}/upload`;
  
  console.log('🔗 [Building Service] Connecting to Upload Service for delete...');
  console.log(`📡 UPLOAD_SERVICE_URL: ${uploadServiceUrl}`);
  console.log(`🌐 Full delete URL: ${deleteUrl}`);
  console.log(`🗑️ Public ID to delete: ${publicId}`);

  try {
    console.log('⏳ Sending delete request to upload service...');
    const res = await axios.delete(deleteUrl, {
      params: { publicId },
    });
    console.log('✅ [Building Service] Successfully connected and deleted from Upload Service');
    console.log(`📤 Response status: ${res.status}`);
    return res.data.message;
  } catch (error) {
    console.error('❌ [Building Service] Failed to connect to Upload Service for delete');
    console.error(`🚨 Error details: ${error.message}`);
    if (error.response) {
      console.error(`📊 Response status: ${error.response.status}`);
      console.error(`📋 Response data:`, error.response.data);
    }
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
