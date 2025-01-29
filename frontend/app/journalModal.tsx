import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  TextInput,
  IconButton,
  Text,
  Button,
  Snackbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native"; // Assuming React Navigation is used
import { Link, router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import margins from "./constants/margins";
export default function Modal() {
  const navigation = useNavigation(); // Hook for navigation
  const [text, setText] = useState(""); // State to handle textbox input
  const params = useLocalSearchParams();
  const isPresented = router.canGoBack();
  const [visible, setVisible] = React.useState(false);
  const [snackbarMessage, setSnackBarMessage] = useState("");
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  console.log(params);

  const createJournal = async () => {
    const apiUrl = `https://my-weather-journal-4d528b61db0e.herokuapp.com/createJournal`;

    const response = await fetch(apiUrl, {
      method: "POST", // Specify POST method
      headers: {
        "Content-Type": "application/json", // Set Content-Type to JSON
      },
      body: JSON.stringify({
        date: new Date().toISOString().split("T")[0], // Convert date to year-month-day format
        weatherData: params,
        text: text,
      }),
    });

    const data = await response.json();
    console.log(data); // Optional: Log the response data for debugging
    if ("message" in data) {
      setSnackBarMessage(data["message"]);
    } else {
      setSnackBarMessage(data["error"]);
    }
    setVisible(true);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Close Button (using IconButton from React Native Paper) */}
          <View style={styles.header}>
            <Text variant="displayLarge">My Mood Today</Text>
            {isPresented && (
              <Link href="../">
                <IconButton
                  icon="close"
                  size={30}
                  onPress={() => router.canGoBack()} // Dismisses the modal
                />
              </Link>
            )}
          </View>

          {/* Textbox using React Native Paper's TextInput */}
          <TextInput
            label="Journal Away..."
            mode="outlined"
            style={styles.textBox}
            value={text}
            onChangeText={setText}
            multiline
          />
          <Button
            icon={"check"}
            mode="contained"
            onPress={() => createJournal()}
          >
            Submit Journal
          </Button>
        </View>
      </TouchableWithoutFeedback>
      <Snackbar visible={visible} onDismiss={onDismissSnackBar}>
        {snackbarMessage}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: margins.marginBottom,
  },
  textBox: {
    flex: 1,
    fontSize: 20,
    color: "#333",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: margins.marginBottom,
  },
});
