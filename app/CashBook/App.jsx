import { useState } from "react";
import { View, StyleSheet, StatusBar, Alert } from "react-native";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import CashIn from "./CashIn";
import CashOut from "./CashOut";

const App = () => {
  const [x, setx] = useState(0);
  const [user, setUser] = useState(null);

  const addusers = (u) => {
    fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(u),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          Alert.alert("Success", "Registered successfully");
        } else {
          Alert.alert(
            "Registration Failed",
            data.message || "Registration failed"
          );
        }
      })
      .catch((err) => {
        Alert.alert("Registration Failed", "Network error. Please try again.");
      });
  };

  const login = async (datas) => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datas),
      });

      const data = await res.json();

      if (res.ok && data.id && data.username) {
        setUser(data);
        setx(2);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Invalid credentials",
        };
      }
    } catch (err) {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const updateUserBalance = () => {
    if (user && user.id) {
      fetch(`${BASE_URL}/api/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.balance !== undefined) {
            setUser((prev) => ({ ...prev, balance: data.balance }));
          }
        })
        .catch((err) => console.error("Failed to update balance:", err));
    }
  };

  const check = () => {
    if (x === 0) return <Register setx={setx} adduser={addusers} />;
    if (x === 1) return <Login setx={setx} login={login} />;
    if (x === 2)
      return (
        <Dashboard
          setx={setx}
          user={user}
          updateUserBalance={updateUserBalance}
        />
      );
    if (x === 3)
      return (
        <CashIn setx={setx} user={user} updateUserBalance={updateUserBalance} />
      );
    if (x === 4)
      return (
        <CashOut
          setx={setx}
          user={user}
          updateUserBalance={updateUserBalance}
        />
      );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      {check()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
});

const BASE_URL = "http://192.168.1.5:8080";

export default App;
