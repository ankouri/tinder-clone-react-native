import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import tw from "tailwind-rn";
import { useNavigation } from "@react-navigation/core";
import useAuth from "../hooks/useAuth";
import getMatchedUserInfo from "./../utils/getMatchedUserInfo";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const ChatRow = ({ matchDetails }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [matchUserInfo, setMatchUserInfo] = React.useState(null);
  const [lastMessage, setLasetMessage] = React.useState("");

  React.useEffect(() => {
    setMatchUserInfo(getMatchedUserInfo(matchDetails.users, user.uid));
  }, [matchDetails, user]);

  React.useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        snapshot => setLasetMessage(snapshot.docs[0]?.data()?.message)
      ),
    [matchDetails, db]
  );

  return (
    <TouchableOpacity
      style={[
        tw("flex-row items-center py-3 px-5 bg-white mx-3 my-1 rounded-lg"),
        styles.cardShadow,
      ]}
      onPress={() => {
        navigation.navigate("Message", {
          matchDetails,
        });
      }}
    >
      <Image
        style={tw("rounded-full h-16 w-16 mr-4")}
        source={{
          uri: matchUserInfo?.photoURL,
        }}
      />
      <View>
        <Text style={tw("text-lg font-semibold")}>
          {matchUserInfo?.displayName}
        </Text>
        <Text style={tw("")}>
          {lastMessage
            ? lastMessage
                .toString()
                .replace(
                  lastMessage
                    .toString()
                    .substring(23, lastMessage.toString().length),
                  "..."
                )
            : "Say Hi!"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatRow;
const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 0.8,
  },
});
