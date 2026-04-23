<template>
  <div class="authenticated-image-container">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="alt"
      :style="style"
      @error="handleError"
    />
    <div v-else-if="loading" class="image-loading">
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="image-error">
      <span>{{ errorMessage }}</span>
    </div>
    <div v-else-if="!src" class="image-placeholder">
      <span>No photo available</span>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';

export default {
  name: 'AuthenticatedImage',
  props: {
    src: {
      type: String,
      required: false,
      default: null
    },
    alt: {
      type: String,
      default: 'Image'
    },
    style: {
      type: [String, Object],
      default: ''
    }
  },
  setup(props) {
    const imageUrl = ref(null);
    const loading = ref(false);
    const error = ref(false);
    const errorMessage = ref('Failed to load image');

    const loadImage = async () => {
      if (!props.src) return;

      // If it's already a data URL or blob URL, use it directly
      if (props.src.startsWith('data:') || props.src.startsWith('blob:')) {
        imageUrl.value = props.src;
        return;
      }

      // Check if it's a secure endpoint that needs authentication
      if (props.src.includes('/secure/')) {
        await fetchSecureImage();
        return;
      }

      // For public storage URLs or external URLs
      imageUrl.value = props.src;
    };

    const fetchSecureImage = async () => {
      try {
        loading.value = true;
        error.value = false;

        let apiPath = props.src;
        
        console.log('Original src:', apiPath);
        
        // If it's a full URL, extract just the path after /api
        if (apiPath.includes('://')) {
          const urlObj = new URL(apiPath);
          // pathname will be like: /backend/api/secure/id-photos/...
          apiPath = urlObj.pathname;
          // Remove /backend/api to get: /secure/id-photos/...
          apiPath = apiPath.replace('/backend/api', '');
        }
        
        // Ensure path starts with /
        if (!apiPath.startsWith('/')) {
          apiPath = '/' + apiPath;
        }

        console.log('Final API path:', apiPath);
        console.log('Full URL:', api.defaults.baseURL + apiPath);

        const response = await api.get(apiPath, {
          responseType: 'blob'
        });

        console.log('Response received:', response.status);
        const blob = response.data;
        imageUrl.value = URL.createObjectURL(blob);
        
      } catch (err) {
        console.error('Failed to load authenticated image:', err);
        console.error('Error details:', err.response || err.message);
        error.value = true;
        
        if (err.response?.status === 401) {
          errorMessage.value = 'Authentication required';
        } else if (err.response?.status === 404) {
          errorMessage.value = 'Image not found';
        } else {
          errorMessage.value = 'Failed to load image';
        }
      } finally {
        loading.value = false;
      }
    };

    const handleError = () => {
      error.value = true;
      errorMessage.value = 'Image load error';
    };

    watch(() => props.src, () => {
      if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl.value);
      }
      imageUrl.value = null;
      loadImage();
    });

    onMounted(() => {
      loadImage();
    });

    onUnmounted(() => {
      if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl.value);
      }
    });

    return {
      imageUrl,
      loading,
      error,
      errorMessage,
      handleError
    };
  }
};
</script>

<style scoped>
.authenticated-image-container {
  display: inline-block;
  position: relative;
}

.image-loading,
.image-error,
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  min-width: 100px;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
}

.spinner {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-error {
  color: #ef4444;
  font-size: 14px;
  padding: 10px;
}
</style>