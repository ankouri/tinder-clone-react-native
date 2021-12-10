import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import useAuth from "../hooks/useAuth";
import tw from "tailwind-rn";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-deck-swiper";
import { data } from "../dummyData";
import { db } from "../firebase";
import {
  onSnapshot,
  doc,
  collection,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import generateId from "./../utils/generateId";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const swiperRef = React.useRef(null);
  const [profiles, setProfiles] = React.useState([]);

  const swipeLeft = async cardIndex => {
    if (!profiles[cardIndex]) return;
    const userSwiped = profiles[cardIndex];
    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };

  const swipeRight = async cardIndex => {
    if (!profiles[cardIndex]) return;
    const userSwiped = profiles[cardIndex];
    console.log("You swiped Match" + userSwiped.displayName);
    const loggedInProfile = await (
      await getDoc(doc(db, "users", user.uid))
    ).data();
    //CHECK IF THE USER SWIPED ON YOU ...
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      documentSnapshot => {
        if (documentSnapshot.exists()) {
          //USER HAS MATCHED WITH YOU BEFORE YOU MATCH WITH THEM...
          console.log(`YOO, U Match with ${userSwiped.displayName}`);
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
          //CREATE A MATCH !!
          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });

          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          //USER HAS SWIPED AS FIRST INTERACTION BETWEEN THE TWO OR DID'T GET SWIPED
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );
  };

  React.useLayoutEffect(
    () =>
      onSnapshot(doc(db, "users", user.uid), snapshot => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),

    []
  );

  React.useEffect(() => {
    let unsub;

    const fetchCards = async () => {
      //GET ARRAY OF PASSES PROFILES
      const passes = await getDocs(collection(db, "users", user.uid, "passes"))
        .then(snapshot => snapshot.docs.map(doc => doc.id))
        .catch(err => alert(err));

      //GET ARRAY OF MATCHES PROFILES
      const swipes = await getDocs(collection(db, "users", user.uid, "swipes"))
        .then(snapshot => snapshot.docs.map(doc => doc.id))
        .catch(err => alert(err));

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ),
        snapshot => {
          setProfiles(
            snapshot.docs
              .filter(doc => doc.id !== user.uid)
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
              }))
          );
        }
      );
    };
    fetchCards();
    return unsub;
  }, []);

  return (
    <SafeAreaView style={tw("flex-1")}>
      <View style={tw("items-center flex-row justify-between px-5 relative")}>
        <TouchableOpacity onPress={logout}>
          <Image
            style={tw("h-8 w-8 rounded-full")}
            source={{ uri: user.photoURL }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Modal");
          }}
        >
          <Image
            resizeMode="contain"
            style={tw("h-12 w-12 top-1")}
            source={require("../assets/images/toppng.com-tinder-logo-transparent-tinder-logo-506x600.png")}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Chat");
          }}
        >
          <Ionicons name="chatbubbles-sharp" size={30} color="#ff5864" />
        </TouchableOpacity>
      </View>
      <View style={tw("flex-1 -mt-6")}>
        <Swiper
          ref={swiperRef}
          containerStyle={{ backgroundColor: "transparent" }}
          cards={profiles}
          stackSize={5}
          cardIndex={0}
          animateCardOpacity
          verticalSwipe={false}
          onSwipedLeft={cardIndex => {
            swipeLeft(cardIndex);
          }}
          onSwipedRight={cardIndex => {
            swipeRight(cardIndex);
          }}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  textAlign: "right",
                  color: "red",
                },
              },
            },
            right: {
              title: "MATCH",
              style: {
                label: {
                  color: "#4ded30",
                },
              },
            },
          }}
          renderCard={card =>
            card ? (
              <View
                key={card.id}
                style={tw("relative bg-white h-3/4 rounded-xl")}
              >
                <Image
                  style={tw("absolute top-0 h-full w-full rounded-xl")}
                  source={{ uri: card.photoURL }}
                />
                <View
                  style={[
                    tw(
                      "absolute bottom-0 justify-between px-6 py-2 rounded-b-xl items-center flex-row bg-white w-full h-20"
                    ),
                    styles.cardShadow,
                  ]}
                >
                  <View>
                    <Text style={tw("text-xl font-bold")}>
                      {card.displayName}
                    </Text>
                    <Text>{card.job}</Text>
                  </View>
                  <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  tw(
                    "relative bg-white h-3/4 rounded-xl justify-center items-center"
                  ),
                  styles.cardShadow,
                ]}
              >
                <Image
                  resizeMode="contain"
                  source={require("../assets/images/toppng.com-tinder-logo-transparent-tinder-logo-506x600.png")}
                  style={tw("absolute top-1/4 h-40 w-40")}
                />
                <Text style={tw("absolute top-3/4 font-bold pb-5")}>
                  {" "}
                  Loading more profiles
                </Text>
              </View>
            )
          }
        />
      </View>
      <View style={tw("flex flex-row justify-evenly mb-10")}>
        <TouchableOpacity
          onPress={() => {
            swiperRef.current.swipeLeft();
          }}
          style={tw(
            "items-center justify-center rounded-full w-16 h-16 bg-red-200"
          )}
        >
          <Entypo name="cross" size={24} color="red" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            swiperRef.current.swipeRight();
          }}
          style={tw(
            "items-center justify-center rounded-full w-16 h-16 bg-green-200"
          )}
        >
          <AntDesign name="heart" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
