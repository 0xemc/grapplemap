import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-orange-500 ">
        Welcome to Nativewind!
      </Text>

      <Link href="/add" className=" border-2 border-orange-500 p-2 rounded-md">
        Go to Add screen
      </Link>
    </View>
  );
}
