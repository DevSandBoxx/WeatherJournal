import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Text, Divider } from "react-native-paper";

const JournalEntryPage = () => {
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const [journals, setJournals] = useState<any | null>(null);
  const containerStyle = { backgroundColor: "white", padding: 20 };
  const params = useLocalSearchParams();

  const fetchJournal = async () => {
    const apiUrl = `http://127.0.0.1:5000/getJournalByDate?date=${params.date}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    setJournals(data[0]);
  };

  const weatherDataLabels = [
    { title: "UV Index Max", value: "uv_index_max" },
    { title: "Precipitation Sum", value: "precipitation_sum" },
    { title: "Sunrise", value: "sunrise" },
    { title: "Sunset", value: "sunset" },
    {
      title: "Precipitation Probability Max",
      value: "precipitation_probability_max",
    },
    { title: "Wind Speed", value: "wind_speed" },
    { title: "Relative Humidity", value: "relative_humidity" },
  ];

  useEffect(() => {
    fetchJournal();
  }, []);

  if (!journals) {
    return (
      <View>
        <ActivityIndicator animating={true} size={"large"} />
      </View>
    );
  }
  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        {/* Text Input Section: Text Field for Journal Entry */}
        <View>
          <Text style={styles.textInput} variant="headlineLarge">
            My Mood
          </Text>
          <Text style={styles.textInput} variant="bodyLarge">
            {journals.text}
          </Text>
        </View>

        <Divider />

        {/* Top Section: City and Temperature */}
        <View style={styles.topSection}>
          <Text variant="displayLarge" style={styles.tempText}>
            {journals.weatherData.temperature_max}°F |{" "}
            {journals.weatherData.temperature_min}°F
          </Text>
        </View>

        {/* Bottom Section: Grid of Weather Information */}
        <View style={styles.gridContainer}>
          {weatherDataLabels.map((item, index) => (
            <View
              key={index}
              style={[
                styles.gridItem,
                (index + 1) % 2 === 0 ? styles.noRightBorder : null, // Removes border for the rightmost cell in each row
              ]}
            >
              <Text variant="bodySmall" style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text variant="displaySmall" style={styles.itemValue}>
                {journals.weatherData[item.value]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

// Sample weather information
const weatherInfo = [
  { title: "Precipitation", value: "10%" },
  { title: "UV Index", value: "5" },
  { title: "Wind Speed", value: "9 mph" },
  { title: "Humidity", value: "69%" },
  { title: "Visibility", value: "10 mi" },
  { title: "Pressure", value: "1015 hPa" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: "white",
  },
  textInput: {
    flex: 1,
    padding: 10,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityText: {
    color: "#6200ee",
    fontWeight: "bold",
    marginBottom: 8,
  },
  tempText: {
    color: "#000",
  },
  gridContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  gridItem: {
    flexBasis: "50%", // Ensures two cells per row
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
  },
  noRightBorder: {
    borderRightWidth: 0,
  },
  itemValue: {
    color: "#333",
  },
  itemTitle: {
    fontSize: 14,
    color: "#666",
  },
  horizontalDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ddd",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default JournalEntryPage;
