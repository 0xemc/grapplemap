import { Text, View, StyleSheet } from "react-native";

export default function GraphScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Graph screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
});
