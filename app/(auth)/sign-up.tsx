import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import React from "react";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp, useOAuth } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import type { Href } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const isFetching = fetchStatus === "fetching";

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)" as Href);
      }
    } catch (err: any) {
      console.error("Google OAuth error:", JSON.stringify(err, null, 2));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUp) return;
    try {
      const { error } = await signUp.password({ emailAddress, password });
      if (error) {
        console.error("Sign-up error:", JSON.stringify(error, null, 2));
        return;
      }
      try {
        await signUp.verifications.sendEmailCode();
        setPendingVerification(true);
      } catch (err: any) {
        console.error("Verification send error:", JSON.stringify(err, null, 2));
      }
    } catch (err: any) {
      console.error("Sign-up exception:", JSON.stringify(err, null, 2));
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;
    try {
      await signUp.verifications.verifyEmailCode({ code });
      console.log(
        "signUp status after verify:",
        signUp.status,
        "missing:",
        signUp.missingFields,
      );
      if (
        signUp.status === "complete" ||
        (signUp.status === "missing_requirements" &&
          (signUp.missingFields?.length ?? 0) === 0)
      ) {
        try {
          await signUp.finalize({
            navigate: ({ decorateUrl }) => {
              const url = decorateUrl("/");
              if (!url.startsWith("http")) router.replace(url as Href);
            },
          });
        } catch (err: any) {
          console.error("Finalize error:", JSON.stringify(err, null, 2));
        }
      } else {
        console.error("Sign-up not complete. Missing:", signUp.missingFields);
      }
    } catch (err: any) {
      console.error("Verification error:", JSON.stringify(err, null, 2));
    }
  };

  // ── Verification screen ──────────────────────────────────
  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-[#FFF7E5] w-full pt-10 pb-10 pl-5 pr-5">
            <Logo />
            <View className="min-h-20" />
            <View className="flex flex-col justify-center items-center gap-2 min-h-20">
              <Text className="text-3xl font-sans-bold">Verify your email</Text>
              <Text className="font-sans-medium text-[#435875] text-center">
                We sent a 6-digit code to {emailAddress}
              </Text>
            </View>
            <View className="border-[#E1DBCA] pt-9 pb-9 pr-6 pl-6 gap-6 border-1 rounded-2xl mt-4">
              <View className="gap-2.5">
                <Text className="font-sans-medium">Verification code</Text>
                <TextInput
                  className="rounded-[14px] py-4.5 px-3.5 border-[#C6BFA2] border-1 text-base"
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  autoFocus
                />
                {errors?.fields?.code && (
                  <Text
                    style={{ color: "#dc2626" }}
                    className="font-sans-medium text-sm"
                  >
                    {errors.fields.code.message}
                  </Text>
                )}
              </View>
              <View className="gap-4">
                <Pressable
                  className="rounded-[14px] py-4.5 px-3.5 bg-[#EA7A53] flex justify-center items-center"
                  onPress={handleVerify}
                  disabled={isFetching || code.length < 6}
                  style={{ opacity: isFetching || code.length < 6 ? 0.6 : 1 }}
                >
                  {isFetching ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="font-sans-bold text-white">
                      Verify & create account
                    </Text>
                  )}
                </Pressable>
                <Pressable
                  className="flex justify-center items-center py-3"
                  disabled={isFetching}
                  onPress={() => signUp?.verifications.sendEmailCode()}
                >
                  <Text className="font-sans-medium text-[#EA7A53]">
                    Resend code
                  </Text>
                </Pressable>
                <Pressable
                  className="flex justify-center items-center py-1"
                  onPress={() => {
                    setPendingVerification(false);
                    setCode("");
                  }}
                >
                  <Text className="font-sans-medium text-[#6B6B6B]">
                    ← Back
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Sign-up screen ───────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-[#FFF7E5] w-full pt-10 pb-10 pl-5 pr-5">
          <Logo />
          <View className="min-h-20" />
          <View className="flex flex-col justify-center items-center gap-2 min-h-20">
            <Text className="text-3xl font-sans-bold">Welcome aboard</Text>
            <Text className="font-sans-medium text-[#435875]">
              Sign up to manage your subscriptions
            </Text>
          </View>
          <View className="border-[#E1DBCA] pt-9 pb-9 pr-6 pl-6 gap-6 border-1 rounded-2xl mt-4">
            {/* ── Google button ── */}
            <Pressable
              onPress={handleGoogleSignUp}
              disabled={googleLoading}
              style={{
                opacity: googleLoading ? 0.7 : 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: "#C6BFA2",
                backgroundColor: "#fff",
              }}
            >
              {googleLoading ? (
                <ActivityIndicator color="#435875" />
              ) : (
                <>
                  <GoogleIcon />
                  <Text
                    style={{
                      fontFamily: "sans-bold",
                      fontSize: 15,
                      color: "#435875",
                    }}
                  >
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>

            {/* ── Divider ── */}
            <View className="flex flex-row items-center gap-3">
              <View className="flex-1 h-[1px] bg-[#E1DBCA]" />
              <Text className="font-sans-medium text-[#A09880] text-sm">
                or
              </Text>
              <View className="flex-1 h-[1px] bg-[#E1DBCA]" />
            </View>

            <View className="gap-2.5">
              <Text className="font-sans-medium">Email</Text>
              <TextInput
                className="rounded-[14px] py-4.5 px-3.5 border-[#C6BFA2] border-1 text-base"
                placeholder="Enter your email"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors?.fields?.emailAddress && (
                <Text
                  style={{ color: "#dc2626" }}
                  className="font-sans-medium text-sm"
                >
                  {errors.fields.emailAddress.message}
                </Text>
              )}
            </View>
            <View className="gap-2.5">
              <Text className="font-sans-medium">Password</Text>
              <TextInput
                className="rounded-[14px] py-4 px-4 border-[#C6BFA2] border-1 text-base"
                placeholder="Enter your password"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {errors?.fields?.password && (
                <Text
                  style={{ color: "#dc2626" }}
                  className="font-sans-medium text-sm"
                >
                  {errors.fields.password.message}
                </Text>
              )}
            </View>
            <View className="gap-5">
              <Pressable
                className="rounded-[14px] py-4.5 px-3.5 bg-[#EA7A53] flex justify-center items-center"
                onPress={handleSignUp}
                disabled={isFetching || !emailAddress || !password}
                style={{
                  opacity: isFetching || !emailAddress || !password ? 0.6 : 1,
                }}
              >
                {isFetching ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-sans-bold text-white">Sign up</Text>
                )}
              </Pressable>
              <View className="flex justify-center items-center">
                <Text className="font-sans-medium text-[#6B6B6B]">
                  Already have an account?{" "}
                  <Link href="/(auth)/sign-in" className="text-[#EA7A53]">
                    Sign in
                  </Link>
                </Text>
              </View>
            </View>
            <View nativeID="clerk-captcha" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Logo() {
  return (
    <View className="flex flex-row justify-center items-center h-30 gap-10">
      <View className="bg-accent h-20 w-20 p-2 flex justify-center items-center rounded-tr-3xl rounded-bl-3xl">
        <Text className="font-sans-bold text-5xl text-white">R</Text>
      </View>
      <View>
        <Text className="text-3xl font-sans-bold">Recurly</Text>
        <Text className="text-lg font-sans-medium text-[#435875]">
          Smart Billing
        </Text>
      </View>
    </View>
  );
}

function GoogleIcon() {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E1DBCA",
      }}
    >
      <Text style={{ fontFamily: "sans-bold", fontSize: 13, color: "#4285F4" }}>
        G
      </Text>
    </View>
  );
}
