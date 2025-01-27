import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function JournalList() {
  const router = useRouter();
  const [journals, setJournals] = useState<any | null>([]);

  const renderJournalItem = ({ item }: any) => (
    <Link href={{ pathname: `./journals/${item.date}`, params: journals.date }}>
      <List.Item title={item.date} />
    </Link>
  );

  const fetchJournals = async () => {
    const apiUrl = `http://127.0.0.1:5000/getAllJournals`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
    setJournals(data);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  if (!journals) {
    return (
      <View>
        <ActivityIndicator animating={true} size={"large"} />
      </View>
    );
  } else if (journals.length <= 0) {
    return (
      <View>
        <Text variant="displayMedium">No Entries</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={journals}
        keyExtractor={(item) => item.date}
        renderItem={renderJournalItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <Divider style={styles.itemDivider} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  listContainer: {
    paddingVertical: 16,
  },
  journalItem: {
    padding: 16,
    backgroundColor: "white",
  },
  cityText: {
    marginTop: 4,
    color: "#555",
  },
  divider: {
    marginVertical: 8,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#ddd",
  },
});
