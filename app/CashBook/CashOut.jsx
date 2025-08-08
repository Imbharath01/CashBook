import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { saveTransactionImage } from "./services/imageStorage";

const BASE_URL = "http://192.168.1.5:8080";

const CashOut = ({ setx, user, updateUserBalance }) => {
  const [image, setImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [capturedTime, setCapturedTime] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleString();
      setDateTime(now);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const imgUri = result.assets[0].uri;
      setImage(imgUri);
      setCapturedTime(new Date().toLocaleString());
    }
  };

  const saveTransaction = async () => {
    if (!amount) {
      Alert.alert("Error", "Please enter an amount.");
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    const transactionData = {
      user: { id: user.id },
      cashIn: 0,
      cashOut: parseFloat(amount),
      notes: description || `Cash Out - ${dateTime}`,
    };

    try {
      console.log("Saving CashOut transaction...");
      console.log("Using BASE_URL:", BASE_URL);
      console.log("Transaction data:", transactionData);
      
      const res = await fetch(`${BASE_URL}/api/transactions/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(transactionData),
        timeout: 10000,
      });

      if (res.ok) {
        const savedTransaction = await res.json();
        console.log("Transaction saved with ID:", savedTransaction.id);

        // Save image locally if available
        if (image && savedTransaction.id) {
          console.log("Saving image locally for transaction:", savedTransaction.id);
          console.log("Image URI:", image);

          try {
            const saveResult = await saveTransactionImage(savedTransaction.id, image);
            console.log("Image save result:", saveResult);
            if (saveResult) {
              console.log("✅ Image saved successfully!");
            } else {
              console.log("❌ Failed to save image");
            }
          } catch (imageError) {
            console.error("Error saving image:", imageError);
          }
        } else {
          console.log("No image to save or no transaction ID");
        }

        Alert.alert("Success", "Transaction saved successfully");

        // ✅ Update dashboard balance & history
        if (updateUserBalance) {
          updateUserBalance();
        }

        // Go back to dashboard
        setx(2);
      } else {
        const errorData = await res.json().catch(() => ({}));
        Alert.alert("Error", errorData.message || "Failed to save transaction.");
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      Alert.alert("Error", "Failed to save transaction.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>💸 Cash Out</Text>
          <Text style={styles.subtitle}>Withdraw money from your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter description (optional)"
              placeholderTextColor="#666"
              multiline={true}
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Current Time</Text>
            <Text style={styles.timeText}>{dateTime}</Text>
          </View>

          <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
            <Text style={styles.cameraButtonText}>📸 Take Photo</Text>
          </TouchableOpacity>

          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              {capturedTime && (
                <Text style={styles.capturedTime}>
                  Captured: {capturedTime}
                </Text>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveTransaction}
            >
              <Text style={styles.saveButtonText}>💾 Save Transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setx(2)}>
              <Text style={styles.backButtonText}>← Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#0f3460",
    textAlign: "center",
  },
  descriptionInput: {
    textAlign: "left",
    textAlignVertical: "top",
    minHeight: 80,
  },
  timeContainer: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  timeLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  cameraButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  capturedTime: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#e94560",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#e94560",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#333",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CashOut;
