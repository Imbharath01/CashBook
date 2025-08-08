import AsyncStorage from '@react-native-async-storage/async-storage';

// Save image URI locally with transaction ID
export const saveTransactionImage = async (transactionId, imageUri) => {
  try {
    console.log("🔄 Starting image save process...");
    console.log("Transaction ID:", transactionId);
    console.log("Image URI:", imageUri);
    
    const imageKey = `transaction_image_${transactionId}`;
    console.log("Storage key:", imageKey);
    
    await AsyncStorage.setItem(imageKey, imageUri);
    console.log("✅ Image saved to AsyncStorage successfully");
    
    // Verify the save by reading it back
    const savedImage = await AsyncStorage.getItem(imageKey);
    console.log("Verification - Saved image URI:", savedImage);
    
    return true;
  } catch (error) {
    console.error("❌ Error saving image locally:", error);
    console.error("Error details:", error.message);
    return false;
  }
};

// Get image URI for a specific transaction
export const getTransactionImage = async (transactionId) => {
  try {
    const imageKey = `transaction_image_${transactionId}`;
    const imageUri = await AsyncStorage.getItem(imageKey);
    return imageUri;
  } catch (error) {
    console.error("❌ Error retrieving image:", error);
    return null;
  }
};

// Delete image for a specific transaction
export const deleteTransactionImage = async (transactionId) => {
  try {
    const imageKey = `transaction_image_${transactionId}`;
    await AsyncStorage.removeItem(imageKey);
    console.log("Image deleted for transaction ${transactionId}");
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};

// Test AsyncStorage functionality
export const testAsyncStorage = async () => {
  try {
    console.log("🧪 Testing AsyncStorage functionality...");
    
    // Test writing
    const testKey = "test_key";
    const testValue = "test_value";
    await AsyncStorage.setItem(testKey, testValue);
    console.log("✅ Test write successful");
    
    // Test reading
    const readValue = await AsyncStorage.getItem(testKey);
    console.log("✅ Test read successful:", readValue);
    
    // Test deletion
    await AsyncStorage.removeItem(testKey);
    console.log("✅ Test delete successful");
    
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log("All AsyncStorage keys:", allKeys);
    
    return true;
  } catch (error) {
    console.error("❌ AsyncStorage test failed:", error);
    return false;
  }
};

// Get all stored image keys
export const getAllImageKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const imageKeys = keys.filter(key => key.startsWith('transaction_image_'));
    console.log("All image keys found:", imageKeys);
    return imageKeys;
  } catch (error) {
    console.error("Error getting image keys:", error);
    return [];
  }
}; 