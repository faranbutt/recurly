import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Onboarding() {
  const router = useRouter();

  return (
    <SafeAreaView className="auth-safe-area">
      <View>
        <Text>Onboarding page</Text>
      </View>
    </SafeAreaView>
  );
}
