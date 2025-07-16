import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
  Image,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import colors from "../themes/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchCitas } from "../services/appointmentService";
import LoadingScreen from "../components/LoadingScreen";
import { fonts } from "../themes/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import EmptyState from "../components/EmptyState";
import CustomHeader from "../components/CustomHeader";
import WarningModal from "../components/WarningModal";
import Buscador from "../components/Buscador";

type Props = NativeStackScreenProps<RootStackParamList, "TusCitas">;

type Cita = {
  id: string;
  fecha: string;
  hora: string;
  especialidad: string;
  programa: string;
  medico: string;
  estado: string;
  grupo: string;
  procedimiento_especifico: string;
};

const AppointmentScreen: React.FC<Props> = ({ navigation }) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /** Función para cerrar sesión */
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("documento");
    Toast.show({
      type: "success",
      text2: "Has cerrado sesión correctamente.",
      position: "bottom",
    });
    navigation.navigate("Login");
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const tipoDocumento =
          (await AsyncStorage.getItem("tipoDocumento")) ?? "";
        const numeroDocumento = (await AsyncStorage.getItem("documento")) ?? "";
        const data = await fetchCitas(tipoDocumento, numeroDocumento);
        // Formateamos los datos según el tipo `Cita`
        const citasFormateadas = data.map((item: any, index: number) => ({
          id: index.toString(),
          fecha: item.fecha_cita?.split(" ")[0] || "",
          hora: item.turno || "",
          especialidad: item.especialidad || "",
          programa: item.programa || "",
          medico: item.nombre_medico || "",
          estado: item.estado || "",
          grupo: item.grupo || "",
          procedimiento_especifico: item.procedimiento_especifico || "",
        }));
        setCitas(citasFormateadas);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCitas = citas
    .filter((c) => c.estado === "AUTORIZADO")
    .filter((c) =>
      [c.medico, c.especialidad].some((field) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  /* Función para capitalizar el nombre */
  const capitalizeName = (text: string): string => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) =>
        word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ");
  };

  /* Función para capitalizar la primera letra de cada oración */
  const capitalizeSentence = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/(^\w{1}|\.\s*\w{1})/g, (match) => match.toUpperCase());
  };

  if (loading) {
    return <LoadingScreen />;
  }
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
        {/* Header transparente */}
        <CustomHeader
          title="Citas"
          showBack
          transparent
          showProfileIcon
          onLogout={() => setModalVisible(true)}
          goBackTo="Home"
        />

        <View style={styles.container}>
          <Buscador
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar cita"
          />

          {/* Lista de Citas */}
          {filteredCitas.length === 0 ? (
            <EmptyState message="No se encontraron citas agendadas por el momento." />
          ) : (
            <FlatList
              data={filteredCitas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const dt = new Date(item.fecha);
                const weekday = dt.toLocaleDateString("es-CO", {
                  weekday: "long",
                });
                return (
                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      {/* PANEL IZQUIERDO: FECHA */}
                      <View style={styles.leftColumn}>
                        <Text style={styles.weekday}>
                          {weekday.charAt(0).toUpperCase() + weekday.slice(1)}
                        </Text>
                        <Text style={styles.dateDay}>{dt.getDate()}</Text>
                        <Text style={styles.dateMonth}>
                          {dt.toLocaleDateString("es-CO", {
                            month: "long",
                          })}
                        </Text>
                        <Text style={styles.dateYear}>{dt.getFullYear()}</Text>
                      </View>

                      {/* PANEL DERECHO: ICONO + DETALLES */}
                      <View style={styles.rightColumn}>
                        <Text style={styles.text}>
                          <Text style={styles.label}>Hora: </Text>
                          {item.hora}
                        </Text>
                        {item.especialidad && item.medico && (
                          <>
                            <Text style={styles.text}>
                              <Text style={styles.label}>Especialidad: </Text>
                              {capitalizeSentence(item.especialidad)}
                            </Text>
                            <Text style={styles.text}>
                              <Text style={styles.label}>Médico: </Text>
                              {capitalizeName(item.medico)}
                            </Text>
                          </>
                        )}
                        {item.grupo && (
                          <Text style={styles.text}>
                            <Text style={styles.label}>
                              Tipo de procedimiento:{" "}
                            </Text>
                            {capitalizeSentence(item.grupo)}
                          </Text>
                        )}
                        {item.procedimiento_especifico && (
                          <Text style={styles.text}>
                            <Text style={styles.label}>Procedimiento: </Text>
                            {capitalizeSentence(item.procedimiento_especifico)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.iconWrapper}>
                      <Image
                        source={require("../../assets/icons/calendar.png")}
                        style={styles.calendarIcon}
                      />
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>

        <WarningModal
          text="¿Estás seguro de que deseas cerrar sesión?"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onConfirm={handleLogout}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const CARD_CONTENT_HEIGHT = verticalScale(150);
const LEFT_COLUMN_WIDTH = scale(96);
const ICON_SIZE = moderateScale(34);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(25),
    paddingTop: verticalScale(8),
  },
  listContent: {
    paddingBottom: verticalScale(14),
  },
  card: {
    position: "relative",
    backgroundColor: colors.white,
    borderRadius: moderateScale(12),
    overflow: "hidden",
    marginBottom: verticalScale(14),
  },
  cardContent: {
    flexDirection: "row",
    width: "100%",
    height: CARD_CONTENT_HEIGHT,
    alignItems: "center",
  },
  leftColumn: {
    width: LEFT_COLUMN_WIDTH,
    height: "100%",
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
  },
  weekday: {
    fontSize: verticalScale(12),
    color: colors.white,
    textTransform: "capitalize",
    fontFamily: fonts.title,
  },
  dateDay: {
    fontSize: verticalScale(36),
    color: colors.white,
    fontFamily: fonts.title,
  },
  dateMonth: {
    fontSize: verticalScale(12),
    color: colors.white,
    fontFamily: fonts.subtitle,
    textTransform: "capitalize",
    borderBottomColor: colors.secondary,
    borderBottomWidth: moderateScale(2),
  },
  dateYear: {
    fontSize: verticalScale(18),
    color: colors.white,
    fontFamily: fonts.body,
    marginTop: verticalScale(4),
  },
  rightColumn: {
    flex: 1,
    padding: moderateScale(12),
    marginLeft: scale(16),
    marginRight: scale(10),
  },
  iconWrapper: {
    position: "absolute",
    left: LEFT_COLUMN_WIDTH - ICON_SIZE / 2,
    top: CARD_CONTENT_HEIGHT / 2 - ICON_SIZE / 2,
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(50),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(8),
    shadowColor: colors.preto,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.2,
    shadowRadius: verticalScale(3),
    elevation: 5,
  },
  calendarIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  text: {
    fontSize: verticalScale(11),
    color: colors.preto,
    marginBottom: verticalScale(4),
    fontFamily: fonts.body,
  },
  label: {
    fontSize: verticalScale(11),
    fontFamily: fonts.title,
    color: colors.preto,
  },
});
export default AppointmentScreen;
