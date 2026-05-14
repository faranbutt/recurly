import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { CATEGORIES } from "@/constants/data";
import { icons } from "@/constants/icons";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/lib/SubscriptionContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
  const { subscriptions, addSubscription } = useSubscriptions();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [subscriptions, search, activeCategory]);

  const monthlyTotal = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const monthly = s.billing === "Yearly" ? s.price / 12 : s.price;
        return sum + monthly;
      }, 0);
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View>
            {/* ── Page header ── */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: "sans-bold",
                  fontSize: 28,
                  color: "#1a1a1a",
                }}
              >
                Subscriptions
              </Text>
              <Pressable
                onPress={() => setModalVisible(true)}
                style={{
                  backgroundColor: "#EA7A53",
                  borderRadius: 14,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Image
                  source={icons.plus}
                  style={{ width: 14, height: 14, tintColor: "#fff" }}
                />
                <Text
                  style={{
                    fontFamily: "sans-bold",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  Add
                </Text>
              </Pressable>
            </View>

            {/* ── Summary card ── */}
            <View
              style={{
                backgroundColor: "#FFF7E5",
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: "#E1DBCA",
                marginBottom: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "sans-medium",
                    fontSize: 13,
                    color: "#A09880",
                  }}
                >
                  Monthly spend
                </Text>
                <Text
                  style={{
                    fontFamily: "sans-bold",
                    fontSize: 26,
                    color: "#1a1a1a",
                    marginTop: 2,
                  }}
                >
                  {formatCurrency(monthlyTotal)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontFamily: "sans-medium",
                    fontSize: 13,
                    color: "#A09880",
                  }}
                >
                  Active
                </Text>
                <Text
                  style={{
                    fontFamily: "sans-bold",
                    fontSize: 26,
                    color: "#EA7A53",
                    marginTop: 2,
                  }}
                >
                  {subscriptions.filter((s) => s.status === "active").length}
                </Text>
              </View>
            </View>

            {/* ── Search bar ── */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFF7E5",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E1DBCA",
                paddingHorizontal: 14,
                marginBottom: 14,
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 16, color: "#A09880" }}>🔍</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search subscriptions..."
                placeholderTextColor="rgba(0,0,0,0.35)"
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  fontFamily: "sans-medium",
                  fontSize: 15,
                  color: "#1a1a1a",
                }}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Text style={{ fontSize: 16, color: "#A09880" }}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* ── Category chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor:
                      activeCategory === cat ? "#081126" : "#FFF7E5",
                    borderWidth: 1,
                    borderColor: activeCategory === cat ? "#081126" : "#E1DBCA",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "sans-bold",
                      fontSize: 13,
                      color: activeCategory === cat ? "#fff" : "#435875",
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* ── Results count ── */}
            <Text
              style={{
                fontFamily: "sans-medium",
                fontSize: 13,
                color: "#A09880",
                marginBottom: 12,
              }}
            >
              {filtered.length} subscription
              {filtered.length !== 1 ? "s" : ""}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() =>
              setExpandedId((curr) => (curr === item.id ? null : item.id))
            }
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text
              style={{
                fontFamily: "sans-bold",
                fontSize: 18,
                color: "#1a1a1a",
              }}
            >
              No subscriptions found
            </Text>
            <Text
              style={{
                fontFamily: "sans-medium",
                fontSize: 14,
                color: "#A09880",
              }}
            >
              {search
                ? "Try a different search term"
                : "Tap Add to get started"}
            </Text>
          </View>
        }
      />

      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addSubscription}
      />
    </SafeAreaView>
  );
}
