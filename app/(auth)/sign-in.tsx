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
import { useSignIn, useOAuth } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import type { Href } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pendingMfa, setPendingMfa] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const isFetching = fetchStatus === "fetching";

  const handleGoogleSignIn = async () => {
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

  const handleSignIn = async () => {
    if (!signIn) return;
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error("Sign-in error:", JSON.stringify(error, null, 2));
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (!url.startsWith("http")) router.replace(url as Href);
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f: any) => f.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        setPendingMfa(true);
      }
    }
  };

  const handleVerify = async () => {
    if (!signIn) return;
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (!url.startsWith("http")) router.replace(url as Href);
        },
      });
    }
  };

  // ── MFA screen ───────────────────────────────────────────
  if (pendingMfa) {
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
              <Text className="text-3xl font-sans-bold">Check your email</Text>
              <Text className="font-sans-medium text-[#435875] text-center">
                We sent a verification code to {emailAddress}
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
                    <Text className="font-sans-bold text-white">Verify</Text>
                  )}
                </Pressable>
                <Pressable
                  className="flex justify-center items-center py-3"
                  onPress={() => signIn?.mfa.sendEmailCode()}
                >
                  <Text className="font-sans-medium text-[#EA7A53]">
                    Resend code
                  </Text>
                </Pressable>
                <Pressable
                  className="flex justify-center items-center py-1"
                  onPress={() => {
                    setPendingMfa(false);
                    setCode("");
                    signIn?.reset();
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

  // ── Sign-in screen ───────────────────────────────────────
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
            <Text className="text-3xl font-sans-bold">Welcome back</Text>
            <Text className="font-sans-medium text-[#435875]">
              Sign in to manage your subscriptions
            </Text>
          </View>
          <View className="border-[#E1DBCA] pt-9 pb-9 pr-6 pl-6 gap-6 border-1 rounded-2xl mt-4">
            {/* ── Google button ── */}
            <Pressable
              onPress={handleGoogleSignIn}
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
              {errors?.fields?.identifier && (
                <Text
                  style={{ color: "#dc2626" }}
                  className="font-sans-medium text-sm"
                >
                  {errors.fields.identifier.message}
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
                onPress={handleSignIn}
                disabled={isFetching || !emailAddress || !password}
                style={{
                  opacity: isFetching || !emailAddress || !password ? 0.6 : 1,
                }}
              >
                {isFetching ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-sans-bold text-white">Sign in</Text>
                )}
              </Pressable>
              <View className="flex justify-center items-center">
                <Text className="font-sans-medium text-[#6B6B6B]">
                  New to Recurly?{" "}
                  <Link href="/(auth)/sign-up" className="text-[#EA7A53]">
                    Create an account
                  </Link>
                </Text>
              </View>
            </View>
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
