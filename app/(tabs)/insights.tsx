import React from "react";
import { Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
const SafeAreaView = styled(RNSafeAreaView);
import { BarChart } from "react-native-gifted-charts";
import { formatCurrency } from "@/lib/utils";
export default function Insights() {
  const barData = [
    { value: 36, label: "Mon" },
    { value: 33, label: "Tue" },
    { value: 23, label: "Wed" },
    { value: 40, label: "Thu", frontColor: "#e37158" },
    { value: 35, label: "Fri" },
    { value: 23, label: "Sat" },
    { value: 24, label: "Sun" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className=" w-full h-full">
        <View className="h-12.5 flex flex-row">
          <View className=" min-w-1/5 flex justify-center items-center">
            <View className="border-1 border-[#C6BFA2] w-12.5 h-12.5 flex justify-center items-center rounded-full">
              <Image
                source={require("../../assets/icons/back.png")}
                style={{ width: 7, height: 14 }}
              />
            </View>
          </View>
          <View className=" min-w-3/5 flex justify-center items-center">
            <Text className="font-sans-bold">Monthly Insights</Text>
          </View>
          <View className=" min-w-1/5 flex justify-center items-center">
            <View className="border-1 border-[#C6BFA2] w-12.5 h-12.5 flex justify-center items-center rounded-full">
              <Image
                source={require("../../assets/icons/menu.png")}
                style={{ width: 7, height: 14 }}
              />
            </View>
          </View>
        </View>
        <View className="h-9 flex flex-row mt-10 items-center">
          <Text className="font-sans-bold w-2/3 flex justify-center items-center">
            Upcoming
          </Text>
          <View className="w-1/3 flex justify-center items-center">
            <View className="min-w-21 h-full border-1 border-[#C6BFA2] rounded-full flex justify-center items-center">
              <Text className="font-sans-medium">View all</Text>
            </View>
          </View>
        </View>

        <View className="mt-5 bg-[#F6ECC9] rounded-2xl px-4 py-7">
          <BarChart
            noOfSections={3}
            barWidth={10}
            spacing={30}
            xAxisType={"dashed"}
            barBorderRadius={5}
            stepValue={15}
            frontColor="black"
            data={barData}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={{
              fontFamily: "sans-bold",
              fontSize: 12,
              color: "#333",
            }}
            yAxisTextStyle={{
              fontFamily: "sans-bold",
              fontSize: 12,
              color: "#333",
            }}
          />
        </View>

        <View className="mt-5  h-21.25 rounded-2xl border-1 border-[#C6BFA2] flex flex-row">
          <View className="w-2/3 flex justify-center pl-4">
            <Text className="font-sans-bold text-lg">Expenses</Text>
            <Text className="font-sans-semibold text-sm text-[#435875]">
              March 2026
            </Text>
          </View>
          <View className="w-1/3 flex flex-col justify-center items-end pr-4">
            <Text className="font-sans-bold text-lg">
              {formatCurrency(424.63)}
            </Text>
            <Text className="font-sans-semibold text-sm text-[#435875]">
              +12%
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
