import { FlatList, Text, View, Pressable } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import images from "@/constants/image";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { useState } from "react";
import { useUser } from "@clerk/expo";

import UpcomingSubscriptionCard from "@/components/UpcomingSubsciptionCard";
import ListHeading from "@/components/listHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useSubscriptions } from "@/lib/SubscriptionContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  const { user } = useUser();
  const { subscriptions, addSubscription } = useSubscriptions();

  const displayName =
    user?.firstName ||
    user?.lastName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  // Written without angle brackets to avoid paste corruption
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState(
    null as string | null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user?.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>
              <Pressable onPress={() => setModalVisible(true)} hitSlop={8}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance: </Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard data={item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No Upcoming Renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No Subscriptions yet</Text>
        }
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addSubscription}
      />
    </SafeAreaView>
  );
}
