import React from "react";
import { View, Text, Image } from "react-native";
import tw from "tailwind-rn";

const SenderMessage = ({ message }) => {
  return (
    <View style={tw("mr-20 justify-start items-center flex-row-reverse mb-2")}>
      <View style={tw("mr-1 ")}>
        <Image
          source={{ uri: message.photoURL }}
          style={tw("h-12 w-12 rounded-full")}
        />
      </View>
      <View
        style={tw(
          "bg-purple-600 rounded-lg rounded-tr-none mt-8 px-2 py-2 mr-1"
        )}
      >
        <Text style={tw("text-white")}>{message.message}</Text>
      </View>
    </View>
  );
};

export default SenderMessage;
