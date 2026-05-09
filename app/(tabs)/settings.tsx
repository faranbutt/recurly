import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useUser, useClerk } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import images from "@/constants/image";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const displayName =
    user?.firstName ||
    user?.lastName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to change your profile photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        type: asset.mimeType ?? "image/jpeg",
        name: "avatar.jpg",
      } as unknown as File;

      await user?.setProfileImage({ file });
      await user?.reload();
    } catch (err: any) {
      console.error("Photo upload error:", err?.message ?? err);
      Alert.alert("Error", "Failed to update profile photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* ── Header ── */}
        <Text
          style={{
            fontSize: 28,
            fontFamily: "sans-bold",
            color: "#1a1a1a",
            marginBottom: 24,
          }}
        >
          Settings
        </Text>

        {/* ── Profile card ── */}
        <View
          style={{
            backgroundColor: "#FFF7E5",
            borderRadius: 20,
            padding: 24,
            alignItems: "center",
            gap: 12,
            borderWidth: 1,
            borderColor: "#E1DBCA",
            marginBottom: 24,
          }}
        >
          <Pressable onPress={handleChangePhoto} disabled={uploadingPhoto}>
            <View style={{ position: "relative" }}>
              <Image
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 3,
                  borderColor: "#EA7A53",
                }}
              />

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#EA7A53",
                  borderRadius: 12,
                  width: 28,
                  height: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#FFF7E5",
                }}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 14 }}>✎</Text>
                )}
              </View>
            </View>
          </Pressable>

          <Text
            style={{
              fontFamily: "sans-bold",
              fontSize: 20,
              color: "#1a1a1a",
            }}
          >
            {displayName}
          </Text>
          <Text
            style={{
              fontFamily: "sans-medium",
              fontSize: 14,
              color: "#435875",
            }}
          >
            {user?.emailAddresses[0]?.emailAddress}
          </Text>

          <Pressable
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
            style={{
              marginTop: 4,
              paddingVertical: 8,
              paddingHorizontal: 20,
              backgroundColor: "#EA7A53",
              borderRadius: 20,
              opacity: uploadingPhoto ? 0.6 : 1,
            }}
          >
            <Text
              style={{ color: "#fff", fontFamily: "sans-bold", fontSize: 14 }}
            >
              {uploadingPhoto ? "Uploading…" : "Change photo"}
            </Text>
          </Pressable>
        </View>

        {/* ── Account section ── */}
        <Text
          style={{
            fontFamily: "sans-bold",
            fontSize: 13,
            color: "#A09880",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          Account
        </Text>
        <View
          style={{
            backgroundColor: "#FFF7E5",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E1DBCA",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <SettingsRow
            label="Email"
            value={user?.emailAddresses[0]?.emailAddress}
          />
          <View
            style={{
              height: 1,
              backgroundColor: "#E1DBCA",
              marginHorizontal: 16,
            }}
          />
          <SettingsRow
            label="Account type"
            value={
              user?.externalAccounts?.length ? `Google` : "Email & Password"
            }
          />
        </View>

        {/* ── Sign out ── */}
        <Pressable
          onPress={handleSignOut}
          style={{
            backgroundColor: "#FFF7E5",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e37158",

            padding: 18,
            alignItems: "center",
          }}
        >
          <Text
            style={{ fontFamily: "sans-bold", fontSize: 16, color: "#dc2626" }}
          >
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ label, value }: { label: string; value?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
      }}
    >
      <Text
        style={{ fontFamily: "sans-medium", fontSize: 15, color: "#435875" }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "sans-medium",
          fontSize: 14,
          color: "#1a1a1a",
          maxWidth: "60%",
          textAlign: "right",
        }}
        numberOfLines={1}
      >
        {value ?? "—"}
      </Text>
    </View>
  );
}
