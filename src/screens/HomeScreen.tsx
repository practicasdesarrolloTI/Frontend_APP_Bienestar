import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  BackHandler,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getPatientByDocument } from "../services/patientService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import LoadingScreen from "../components/LoadingScreen";
import Toast from "react-native-toast-message";
import HomeHeader from "../components/HomeHeader";
import LogOutModal from "../components/WarningModal";
import Carousel from "../components/Carousel";
import CustomHeader from "../components/CustomHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const menuItems = [
  {
    id: "1",
    name: "Información",
    image: require("../../assets/buttons/informacion.png"),
    screen: "Informacion",
  },
  {
    id: "2",
    name: "Citas",
    image: require("../../assets/buttons/citas.png"),
    screen: "TusCitas",
  },
  {
    id: "3",
    name: "Programas",
    image: require("../../assets/buttons/programas.png"),
    screen: "TusProgramas",
  },
  {
    id: "4",
    name: "Resultados",
    image: require("../../assets/buttons/resultados.png"),
    screen: "Resultados",
  },
  {
    id: "5",
    name: "Medicamentos",
    image: require("../../assets/buttons/medicamentos.png"),
    screen: "Medicamentos",
  },
  {
    id: "6",
    name: "Autocuidado",
    image: require("../../assets/buttons/autocuidado.png"),
    screen: "Autocuidado",
  },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [nombrePaciente, setNombrePaciente] = useState<string | null>(null);
  const [sexo, setSexo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("documento");
    Toast.show({
      type: "success",
      text2: "Has cerrado sesión correctamente.",
      position: "bottom",
    });
    navigation.replace("Login");
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          setModalVisible(true);
          return true;
        }
      );
      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {
    (async () => {
      try {
        const documento = await AsyncStorage.getItem("documento");
        if (!documento) throw new Error("No hay documento");

        const p = await getPatientByDocument(documento);
        const primer = p?.primer_nombre ?? "";
        const segundo = p?.segundo_nombre ?? "";
        const apellido = p?.primer_apellido ?? "";
        const nombre =
          segundo !== "" ? `${primer} ${segundo}` : `${primer} ${apellido}`;

        setNombrePaciente(nombre);
        setSexo(p?.sexo ?? null);
      } catch {
        setHasError(true);
      } finally {
          setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <ImageBackground
        source={require("../../assets/backgrounds/Inicio.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        {hasError ? (
          <CustomHeader
            title="Inicio"
            showBack={false}
            transparent
            showProfileIcon
            onLogout={() => setModalVisible(true)}
          />
        ) : (
          nombrePaciente &&
          sexo && (
            <HomeHeader
              nombre={nombrePaciente}
              sexo={sexo}
              onLogout={() => setModalVisible(true)}
            />
          )
        )}
        <Carousel />
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen as any)}
              >
                <Image
                  source={item.image}
                  style={styles.menuImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <LogOutModal
            text="¿Estás seguro de que deseas cerrar sesión?"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            onConfirm={handleLogout}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ASPECT_RATIO = 150 / 142;

// SUPONGAMOS que quieres que cada ítem ocupe el 45 % del ancho de pantalla:
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH / ASPECT_RATIO;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.025,
    paddingBottom: SCREEN_WIDTH * 0.025,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: scale(5),
    paddingBottom: verticalScale(5),
  },
  menuItem: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_WIDTH * 0.1, 
    overflow: "hidden",
    margin: SCREEN_WIDTH * 0.0125, 

    justifyContent: "center",
    alignItems: "center",
  },
  menuImage: {
    width: "98%",
    height: "98%",
    borderRadius: scale(15),
  },
});

export default HomeScreen;
