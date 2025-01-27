import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Divider,
  FAB,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import * as Location from "expo-location";
import * as Localization from "expo-localization";

export interface WeatherData {
  precipitation_probability_max: number; // Maximum precipitation probability (in %)
  precipitation_sum: number; // Total precipitation (in inches or relevant unit)
  relative_humidity: number; // Relative humidity (in %)
  sunrise: number; // Sunrise time (ISO string or formatted date)
  sunset: number; // Sunset time (ISO string or formatted date)
  temperature_max: number; // Maximum temperature (in °F or relevant unit)
  temperature_min: number; // Minimum temperature (in °F or relevant unit)
  uv_index_max: number; // Maximum UV index
  wind_speed: number; // Wind speed (in mph or relevant unit)
  [key: string]: number | string;
}

interface UserLocation {
  location: Location.LocationObject;
  city: string | undefined;
}

export default function HomeScreen() {
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: "white", padding: 20 };
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const formatDate = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(new Date());
  };

  const getCity = async (latitude: number, longitude: number) => {
    try {
      // Ask for location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
      }

      const googleMapsAPIKey = "AIzaSyAGAtkWwpcIP-GOTRzpHfxR8bjiNKBnV88"; // Replace with your API key
      const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsAPIKey}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      let city = "";

      if (response.status == 200 && data.results!.length > 0) {
        // Extract city from the response
        city = data.results[0].address_components.find((component: any) =>
          component.types.includes("locality")
        )?.long_name;
      } else {
        console.log("No results from API");
      }

      return city;
    } catch (error) {
      Alert.alert("Error", "Could not get location.");
    }
  };

  const getLocation = async () => {
    // Request permission to access location
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    // Get the current location
    let location = await Location.getCurrentPositionAsync({});
    let city = await getCity(
      location.coords.latitude,
      location.coords.longitude
    );

    setUserLocation({ location, city });
  };

  const fetchWeatherData = async () => {
    if (userLocation) {
      try {
        // Replace with your API URL
        const timeZone = Localization.getCalendars()[0].timeZone;
        const apiUrl = `http://127.0.0.1:5000/getWeather?latitude=${userLocation.location.coords.latitude}&longitude=${userLocation.location.coords.longitude}&timezone=${timeZone}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        setWeatherData(data);
      } catch (error) {
        setErrorMsg("Failed to fetch weather data");
      }
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    // Fetch weather data after location is fetched
    if (userLocation) {
      fetchWeatherData();
    }
  }, [userLocation]);

  if (!(weatherData && userLocation)) {
    return (
      <View>
        <ActivityIndicator animating={true} size={"large"} />
      </View>
    );
  }
  return (
    <>
      <View style={styles.container}>
        {/* Top Section: City and Temperature */}
        <View style={styles.topSection}>
          <Text variant="headlineSmall" style={styles.cityText}>
            {formatDate()} | {userLocation.city}
          </Text>
          <Divider />
          <Text variant="displayLarge" style={styles.tempText}>
            {weatherData.temperature_max}°F | {weatherData.temperature_min}°F
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
                {weatherData[item.value]}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Link
        href={{
          pathname: "/journalModal",
          params: weatherData,
        }}
      >
        <FAB icon="plus" style={styles.fab} />
      </Link>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
        >
          <Text>Example Modal. Click outside this area to dismiss.</Text>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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
