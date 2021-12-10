import React from "react";
import { View, Text, Image } from "react-native";
import tw from "tailwind-rn";

const RecieverMessage = ({ message }) => {
  return (
    <View style={tw("mr-20 justify-start items-center flex-row mb-2")}>
      <View style={tw("ml-1")}>
        <Image
          source={{ uri: message.photoURL }}
          style={tw("h-12 w-12 rounded-full")}
        />
      </View>
      <View
        style={tw(
          "bg-purple-600 rounded-lg rounded-tl-none mt-8 px-2 py-2 ml-1"
        )}
      >
        <Text style={tw("text-white")}>{message.message}</Text>
      </View>
    </View>
  );
};

export default RecieverMessage;
