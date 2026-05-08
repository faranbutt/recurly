import { formatCurrency } from "@/lib/utils";
import React from "react";
import { View, Text, Image } from "react-native";

export default function UpcomingSubscriptionCard({
  data: { name, price, daysLeft, icon, currency },
}: UpcomingSubscription) {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View className="">
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1 ? `${daysLeft} days left` : "last day"}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
