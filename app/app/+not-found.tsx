import { View } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not Found" }} />
      <View className="flex-1 bg-[#25292e] items-center justify-center">
        <Link href="/" className="text-white underline text-[20px]">
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}
