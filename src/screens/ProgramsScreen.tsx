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
  Dimensions,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import colors from "../themes/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchProgramas } from "../services/programService";
import LoadingScreen from "../components/LoadingScreen";
import { fonts } from "../themes/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomHeader from "../components/CustomHeader";
import LogOutModal from "../components/WarningModal";
import Toast from "react-native-toast-message";
import EmptyState from "../components/EmptyState";
import Buscador from "../components/Buscador";

type Props = NativeStackScreenProps<RootStackParamList, "TusProgramas">;

type Programa = {
  id: string;
  fecha_cita: string;
  programa: string;
  hora: string;
  medico: string;
  especialidad: string;
  estado: string;
};

const ProgramsScreen: React.FC<Props> = ({ navigation }) => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [filteredProgramas, setFilteredProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /** Función para cerrar sesión */
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("documento");
    Toast.show({
      type: "success",
      text1: "Sesión cerrada",
      text2: "Has cerrado sesión correctamente.",
    });
    navigation.navigate("Login");
  };

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const tipo = await AsyncStorage.getItem("tipoDocumento");
        const doc = await AsyncStorage.getItem("documento");
        if (!tipo || !doc) throw new Error("Datos incompletos");
        const data = await fetchProgramas(tipo, doc);
        setProgramas(data);
        setFilteredProgramas(data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, []);

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
        {/* Header transparente */}
        <CustomHeader
          title="Programas"
          showBack
          transparent
          showProfileIcon
          onLogout={() => setModalVisible(true)}
        />

        <View style={styles.container}>
          {/* Buscador */}
          <Buscador
            value={searchQuery}
            onChange={(text) => {
              setSearchQuery(text);
              const lowerText = text.toLowerCase();
              const filtered = programas.filter((programa) =>
                [programa.programa, programa.medico, programa.especialidad]
                  .join(" ")
                  .toLowerCase()
                  .includes(lowerText)
              );
              setFilteredProgramas(filtered);
            }}
            placeholder="Buscar programas"
          />

          {/* Lista de Programas */}
          {filteredProgramas.length === 0 ? (
            <EmptyState message="No se encontraron programas por el momento" />
          ) : (
            <FlatList
              data={filteredProgramas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const tieneCita =
                  item.fecha_cita &&
                  !isNaN(new Date(item.fecha_cita).getTime());
                let dt: Date | null = null;
                if (tieneCita) {
                  dt = new Date(item.fecha_cita);
                }
                return (
                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      {/* COLUMNA IZQUIERDA: Fecha o “Sin cita” */}
                      <View style={styles.leftColumn}>
                        {tieneCita && dt ? (
                          <>
                            <Text style={styles.dateDay}>{dt.getDate()}</Text>
                            <Text style={styles.dateMonth}>
                              {dt.toLocaleDateString("es-CO", {
                                month: "long",
                              })} 
                            </Text>
                            <Text style={styles.dateYear}>
                              {dt.getFullYear()}
                            </Text>
                          </>
                        ) : (
                          <Text
                            style={[styles.noCitas, { textAlign: "center" }]}
                          >
                            Sin cita{"\n"}próxima
                          </Text>
                        )}
                      </View>

                      {/* COLUMNA DERECHA: Detalles del programa */}
                      <View style={styles.rightColumn}>
                        <Text style={styles.text}>
                          <Text style={styles.label}>Programa: </Text>
                          {item.programa}
                        </Text>
                        {item.medico !== null && (
                          <Text style={styles.text}>
                            <Text style={styles.label}>Médico: </Text>
                            {capitalizeName(item.medico)}
                          </Text>
                        )}
                        {item.especialidad && item.especialidad !== null && (
                          <Text style={styles.text}>
                            <Text style={styles.label}>Especialidad: </Text>
                            {capitalizeName(item.especialidad)}
                          </Text>
                        )}
                        {item.hora && item.hora !== " " && (
                          <Text style={styles.text}>
                            <Text style={styles.label}>Hora: </Text>
                            {item.hora}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Ícono superpuesto */}
                    <View style={styles.iconWrapper}>
                      <Image
                        source={require("../../assets/icons/chart.png")}
                        style={styles.calendarIcon}
                      />
                    </View>
                  </View>
                );
              }}
            />
          )}

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

const CARD_CONTENT_HEIGHT = verticalScale(170);
const LEFT_COLUMN_WIDTH = scale(98);
const ICON_SIZE = scale(34);
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(25),
    paddingTop: verticalScale(8),
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
    borderColor: colors.secondary,
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
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
  noCitas: {
    fontSize: moderateScale(16),
    color: colors.white,
    fontFamily: fonts.subtitle,
    borderBottomColor: colors.secondary,
    borderBottomWidth: moderateScale(2),
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
    width: scale(22),
    height: scale(22),
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
export default ProgramsScreen;
