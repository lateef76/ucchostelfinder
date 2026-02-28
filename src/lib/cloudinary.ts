import { Cloudinary } from '@cloudinary/url-gen';
import { fill, scale, thumbnail } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';

// Initialize Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }
});

// Upload preset from environment
export const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ==================== Image Transformation Presets ====================

// For mobile-first responsive images
export const imagePresets = {
  // Thumbnail - for favorite lists, small cards (150x150)
  thumbnail: (publicId: string) => 
    cld
      .image(publicId)
      .resize(thumbnail().width(150).height(150).gravity(autoGravity()))
      .delivery(quality(autoQuality()))
      .delivery(format(autoFormat())),

  // Card - for hostel list view (400x300)
  card: (publicId: string) => 
    cld
      .image(publicId)
      .resize(fill().width(400).height(300).gravity(autoGravity()))
      .delivery(quality(autoQuality()))
      .delivery(format(autoFormat())),

  // Detail - for hostel detail page hero (800x600)
  detail: (publicId: string) => 
    cld
      .image(publicId)
      .resize(fill().width(800).height(600).gravity(autoGravity()))
      .delivery(quality(autoQuality()))
      .delivery(format(autoFormat())),

  // Full - for full-screen gallery (1080p max)
  full: (publicId: string) => 
    cld
      .image(publicId)
      .resize(scale().width(1080))
      .delivery(quality(autoQuality()))
      .delivery(format(autoFormat())),

  // Avatar - for user profiles (100x100)
  avatar: (publicId: string) => 
    cld
      .image(publicId)
      .resize(thumbnail().width(100).height(100).gravity(autoGravity()))
      .delivery(quality(autoQuality()))
      .delivery(format(autoFormat())),
};

// ==================== Helper Functions ====================

/**
 * Get optimized image URL for a specific use case
 */
export const getOptimizedImageUrl = (
  publicId: string, 
  preset: keyof typeof imagePresets = 'card'
): string => {
  try {
    return imagePresets[preset](publicId).toURL();
  } catch (error) {
    console.error('Error generating image URL:', error);
    return ''; // Return empty string, component should handle fallback
  }
};

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  const matches = url.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp)/);
  return matches ? matches[1] : null;
};

/**
 * Generate blur placeholder for lazy loading
 */
export const getBlurPlaceholder = (publicId: string): string => {
  return cld
    .image(publicId)
    .resize(scale().width(20))
    .delivery(quality('auto:low'))
    .format('auto')
    .toURL();
};

// ==================== Upload Widget Configuration ====================

interface UploadWidgetOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  cropping?: boolean;
  folder?: string;
  tags?: string[];
}

export const getUploadWidgetConfig = (options: UploadWidgetOptions = {}) => {
  const {
    maxFiles = 10,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    cropping = true,
    folder = 'hostels',
    tags = [],
  } = options;

  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
    sources: ['local', 'camera', 'url'], // Allow camera for mobile
    multiple: maxFiles > 1,
    maxFiles,
    maxFileSize,
    cropping,
    croppingAspectRatio: 16 / 9, // Widescreen for hostel photos
    croppingShowDimensions: true,
    folder,
    tags: ['ucc-hostel-finder', ...tags],
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    maxImageWidth: 2000,
    maxImageHeight: 2000,
    // Mobile-friendly settings
    showPoweredBy: false,
    autoMinimize: true,
    language: 'en',
    styles: {
      palette: {
        window: '#FFFFFF',
        windowBorder: '#0a2472', // UCC blue
        tabIcon: '#0a2472',
        menuIcons: '#5A5A5A',
        textDark: '#000000',
        textLight: '#FFFFFF',
        link: '#0a2472',
        action: '#f4c430', // UCC gold
        inactiveTabIcon: '#8E8E8E',
        error: '#F44235',
        inProgress: '#0a2472',
        complete: '#20B832',
        sourceBg: '#F4F4F5'
      },
      fonts: {
        default: {
          active: true
        }
      }
    }
  };
};

// ==================== Validation Functions ====================

export const validateImage = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a JPEG, PNG, WebP, or HEIC image'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image must be less than 10MB'
    };
  }

  return { valid: true };
};

// ==================== Upload Response Types ====================

export interface CloudinaryUploadResult {
  event: 'success';
  info: {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    created_at: string;
    tags: string[];
    folder: string;
    original_filename: string;
  };
}

export interface CloudinaryErrorResult {
  event: 'error';
  info: {
    message: string;
    status: string;
  };
}