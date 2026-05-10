import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { icons } from "@/constants/icons";
import { CATEGORIES } from "@/constants/data";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[1]); // default first real category
  const [billing, setBilling] = useState<"Monthly" | "Yearly">("Monthly");

  const handleSubmit = () => {
    if (!name || !price) return;
    const newSub: Subscription = {
      id: Date.now().toString(),
      icon: icons.add, // placeholder – you can improve this
      name,
      price: parseFloat(price),
      currency: "USD",
      billing,
      category,
      status: "active",
    };
    onSubmit(newSub);
    onClose();
    setName("");
    setPrice("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background rounded-t-3xl p-5">
          <Text className="text-2xl font-sans-bold mb-4">Add Subscription</Text>

          <TextInput
            className="border border-border rounded-xl p-3 mb-3"
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            className="border border-border rounded-xl p-3 mb-3"
            placeholder="Price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {CATEGORIES.filter((c) => c !== "All").map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full mr-2 ${category === cat ? "bg-accent" : "bg-muted"}`}
              >
                <Text
                  className={category === cat ? "text-white" : "text-primary"}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View className="flex-row gap-3 mb-5">
            <Pressable
              onPress={() => setBilling("Monthly")}
              className={`flex-1 py-3 rounded-xl ${billing === "Monthly" ? "bg-accent" : "bg-muted"}`}
            >
              <Text
                className={`text-center ${billing === "Monthly" ? "text-white" : "text-primary"}`}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setBilling("Yearly")}
              className={`flex-1 py-3 rounded-xl ${billing === "Yearly" ? "bg-accent" : "bg-muted"}`}
            >
              <Text
                className={`text-center ${billing === "Yearly" ? "text-white" : "text-primary"}`}
              >
                Yearly
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 rounded-xl bg-muted"
            >
              <Text className="text-center text-primary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-accent"
            >
              <Text className="text-center text-white font-sans-bold">
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
