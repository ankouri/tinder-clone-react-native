import React from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import tw from "tailwind-rn";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../hooks/useAuth";
import { useNavigation } from "@react-navigation/core";
import { db } from "../firebase";
import { setDoc, doc, serverTimestamp } from "@firebase/firestore";
const ModalScreen = () => {
  const [image, setImage] = React.useState(null);
  const [job, setJob] = React.useState(null);
  const [age, setAge] = React.useState(null);
  const { user } = useAuth();
  const navigation = useNavigation();
  const incompleteForm = !image || !job || !age;

  const updateProfileInfo = () => {
    setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      displayName: user.displayName,
      photoURL: image,
      job: job,
      age: age,
      timestamp: serverTimestamp(),
    })
      .then(() => {
        navigation.navigate("Home");
      })
      .catch(err => {
        alert(err.message);
      });
  };

  return (
    <SafeAreaView style={tw("flex-1 items-center pt-1")}>
      <Image
        style={tw("h-20 w-full")}
        source={require("../assets/images/logo-text.png")}
        resizeMode="contain"
      />
      <Text style={tw("text-xl text-gray-500 p-2 font-light")}>
        Welcome {user.displayName}
      </Text>

      <Text style={tw("text-center p-4 text-red-400 font-light")}>
        Step 1: Profile Picture
      </Text>
      <TextInput
        value={image}
        onChangeText={setImage}
        style={tw("text-center text-xl pb-2")}
        placeholder="Enter a Profile Pic URL"
      />
      <Text style={tw("text-center p-4 text-red-400 font-light")}>
        Step 2: The Job
      </Text>
      <TextInput
        value={job}
        onChangeText={setJob}
        style={tw("text-center text-xl pb-2")}
        placeholder="Enter Your Job"
      />
      <Text style={tw("text-center p-4 text-red-400 font-light")}>
        Step 3: The Age
      </Text>
      <TextInput
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        style={tw("text-center text-xl pb-2")}
        placeholder="Enter Your Age"
      />
      <TouchableOpacity
        onPress={updateProfileInfo}
        diabled={incompleteForm}
        style={[
          tw("w-64 p-3 rounded-xl absolute bottom-10"),
          incompleteForm ? tw("bg-gray-400") : tw("bg-red-400"),
        ]}
      >
        <Text style={tw("text-center text-white text-xl")}>Update Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ModalScreen;
