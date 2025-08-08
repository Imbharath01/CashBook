import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  Modal,
  TextInput,
} from "react-native";
import {
  testAsyncStorage,
  getAllImageKeys,
  getTransactionImage,
} from "./services/imageStorage";

const BASE_URL = "http://192.168.1.5:8080";

const Dashboard = ({ setx, user, updateUserBalance }) => {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [transactionImages, setTransactionImages] = useState({});
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchTransactions = () => {
    if (user && user.id) {
      fetch(`${BASE_URL}/api/transactions/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          // Sort transactions by date (newest first)
          const sortedTransactions = data.sort(
            (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
          );
          setTransactions(sortedTransactions);
          // Load images for all transactions
          loadTransactionImages(sortedTransactions);
        })
        .catch((err) => console.error("Transaction fetch error:", err));
    }
  };

  const loadTransactionImages = async (transactions) => {
    const images = {};
    for (const transaction of transactions) {
      if (transaction.id) {
        const imageUri = await getTransactionImage(transaction.id);
        if (imageUri) {
          images[transaction.id] = imageUri;
        }
      }
    }
    setTransactionImages(images);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
    updateUserBalance();
    setRefreshing(false);
  };

  const handleTransactionOptions = (transaction) => {
    setSelectedTransaction(transaction);
    setShowOptionsModal(true);
  };

  const handleEditTransaction = () => {
    if (selectedTransaction) {
      setEditAmount(selectedTransaction.cashIn > 0 ? selectedTransaction.cashIn.toString() : selectedTransaction.cashOut.toString());
      setEditNotes(selectedTransaction.notes || "");
      setShowOptionsModal(false);
      setShowEditModal(true);
    }
  };

  const handleDeleteTransaction = () => {
    if (selectedTransaction) {
      Alert.alert(
        "Delete Transaction",
        "Are you sure you want to delete this transaction?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteTransaction(selectedTransaction.id),
          },
        ]
      );
    }
    setShowOptionsModal(false);
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Alert.alert("Success", "Transaction deleted successfully");
        fetchTransactions();
        updateUserBalance();
      } else {
        Alert.alert("Error", "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Delete transaction error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const saveEditedTransaction = async () => {
    if (!editAmount || isNaN(editAmount) || parseFloat(editAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const updatedTransaction = {
        ...selectedTransaction,
        cashIn: selectedTransaction.type === "CASHIN" ? parseFloat(editAmount) : 0,
        cashOut: selectedTransaction.type === "CASHOUT" ? parseFloat(editAmount) : 0,
        notes: editNotes,
      };

      const response = await fetch(`${BASE_URL}/api/transactions/${selectedTransaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTransaction),
      });

      if (response.ok) {
        Alert.alert("Success", "Transaction updated successfully");
        setShowEditModal(false);
        fetchTransactions();
        updateUserBalance();
      } else {
        Alert.alert("Error", "Failed to update transaction");
      }
    } catch (error) {
      console.error("Update transaction error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  useEffect(() => {
    fetchTransactions();
    updateUserBalance();
  }, [user]);

  const renderTransaction = ({ item, index }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => {
        console.log("🎯 Transaction tapped:", item.id);
        // No modal, just log
      }}
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <Text
            style={[
              styles.transactionType,
              item.type === "CASHIN" ? styles.cashInType : styles.cashOutType,
            ]}
          >
            {item.type === "CASHIN" ? "💰 Cash In" : "💸 Cash Out"}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(item.transactionDate).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              item.type === "CASHIN"
                ? styles.cashInAmount
                : styles.cashOutAmount,
            ]}
          >
            ₹{item.cashIn > 0 ? item.cashIn : item.cashOut}
          </Text>
          <View style={styles.rightActions}>
            <Text style={styles.imageIndicator}>📷</Text>
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => handleTransactionOptions(item)}
            >
              <Text style={styles.optionsText}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {item.notes && <Text style={styles.transactionNotes}>{item.notes}</Text>}

      {/* Display image if available */}
      {transactionImages[item.id] && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: transactionImages[item.id] }}
            style={styles.transactionImage}
            resizeMode="contain"
          />
          <Text style={styles.imageNote}>✅ Image found and loaded!</Text>
        </View>
      )}
      {!transactionImages[item.id] && (
        <View style={styles.imageContainer}>
          <Text style={styles.noImageText}>📷 No image available</Text>
          <Text style={styles.imageNote}>
            No receipt image was captured for this transaction
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user.username}!</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{user.balance?.toFixed(2) || "0.00"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cashInButton]}
            onPress={() => setx(3)}
          >
            <Text style={styles.actionButtonText}>💰 Cash In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cashOutButton]}
            onPress={() => setx(4)}
          >
            <Text style={styles.actionButtonText}>💸 Cash Out</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start by adding some cash in or cash out
              </Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderTransaction}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => setx(1)}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <Text style={styles.modalTitle}>Transaction Options</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleEditTransaction}
            >
              <Text style={styles.modalOptionText}>✏️ Edit Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, styles.deleteOption]}
              onPress={handleDeleteTransaction}
            >
              <Text style={[styles.modalOptionText, styles.deleteText]}>🗑️ Delete Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>
            
            <View style={styles.editInputContainer}>
              <Text style={styles.editLabel}>Amount (₹)</Text>
              <TextInput
                style={styles.editInput}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.editInputContainer}>
              <Text style={styles.editLabel}>Description</Text>
              <TextInput
                style={[styles.editInput, styles.editNotesInput]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Enter description"
                placeholderTextColor="#666"
                multiline={true}
                numberOfLines={3}
              />
            </View>

            <View style={styles.editButtonContainer}>
              <TouchableOpacity
                style={styles.editSaveButton}
                onPress={saveEditedTransaction}
              >
                <Text style={styles.editSaveText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editCancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.editCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  welcomeText: {
    fontSize: 18,
    color: "#888",
    marginBottom: 5,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  balanceCard: {
    backgroundColor: "#16213e",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cashInButton: {
    backgroundColor: "#4CAF50",
  },
  cashOutButton: {
    backgroundColor: "#e94560",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#888",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  transactionCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cashInType: {
    color: "#4CAF50",
  },
  cashOutType: {
    color: "#e94560",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cashInAmount: {
    color: "#4CAF50",
  },
  cashOutAmount: {
    color: "#e94560",
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
  },
  transactionNotes: {
    fontSize: 14,
    color: "#ccc",
    fontStyle: "italic",
  },
  imageIndicator: {
    fontSize: 16,
    marginLeft: 8,
    color: "#888",
  },
  logoutButton: {
    backgroundColor: "#333",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2a2a40",
    borderWidth: 1,
    borderColor: "#3a3a50",
    marginTop: 10,
  },
  transactionImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 5,
  },
  noImageText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  imageNote: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionsButton: {
    marginLeft: 8,
    padding: 4,
  },
  optionsText: {
    fontSize: 20,
    color: "#888",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsModal: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#1a1a2e",
  },
  deleteOption: {
    backgroundColor: "#2d1b1b",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  deleteText: {
    color: "#ff6b6b",
  },
  modalCancel: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#333",
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  editModal: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  editInputContainer: {
    marginBottom: 15,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  editNotesInput: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  editButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  editSaveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  editSaveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  editCancelButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  editCancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Dashboard;
