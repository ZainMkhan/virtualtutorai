// Image upload service - stores images and returns URLs for use in metadata
// Using ImgBB as a free, simple image hosting solution

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class ImageUploadService {
  // Using ImgBB free API - no authentication needed for basic uploads
  private readonly IMGBB_API_URL = 'https://api.imgbb.com/1/upload';
  private readonly IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'a672038f82af0cd';

  /**
   * Upload image file and get back a URL
   * @param file - Image file to upload
   * @returns Promise with image URL or error
   */
  async uploadImage(file: File): Promise<ImageUploadResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image',
        };
      }

      // Limit file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Image must be less than 10MB',
        };
      }

      // Convert to Base64
      const base64 = await this.fileToBase64(file);
      const base64Data = base64.split(',')[1] || base64;

      // Create FormData for ImgBB API
      const formData = new FormData();
      formData.append('image', base64Data);
      formData.append('key', this.IMGBB_API_KEY);
      formData.append('name', file.name);

      // Upload to ImgBB
      const response = await fetch(this.IMGBB_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error?.message || 'Upload failed',
        };
      }

      return {
        success: true,
        url: data.data.display_url || data.data.url,
      };
    } catch (error: any) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(files: File[]): Promise<ImageUploadResult[]> {
    return Promise.all(files.map(file => this.uploadImage(file)));
  }

  /**
   * Convert File to Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image URL
   */
  isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

export const imageUploadService = new ImageUploadService();
