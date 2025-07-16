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
import { fetchMedicamentos } from "../services/medicamentService";
import { fonts } from "../themes/fonts";
import LoadingScreen from "../components/LoadingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EmptyState from "../components/EmptyState";
import Toast from "react-native-toast-message";
import CustomHeader from "../components/CustomHeader";
import LogOutModal from "../components/WarningModal";
import Buscador from "../components/Buscador";

type Props = NativeStackScreenProps<RootStackParamList, "Medicamentos">;

type Medicamento = {
  id: string;
  nombre: string;
  cantidad: number;
  dosificacion: number;
  presentacion: string;
  fechaVencimiento: string;
  dias_tratamiento: number;
  indicaciones: string;
};

const MedicamentScreen: React.FC<Props> = ({ navigation }) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMedicamentos, setFilteredMedicamentos] = useState<
    Medicamento[]
  >([]);

  /** Función para cerrar sesión */
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("documento");
    Toast.show({
      type: "success",
      text1: "Sesión cerrada",
      text2: "Has cerrado sesión correctamente.",
      position: "bottom",
    });
    navigation.navigate("Login");
  };

  const loadData = async () => {
    try {
      const tipo = await AsyncStorage.getItem("tipoDocumento");
      const doc = await AsyncStorage.getItem("documento");
      if (!tipo || !doc) throw new Error("Faltan datos del paciente");

      const data = await fetchMedicamentos(tipo, doc);
      setMedicamentos(data);
      setFilteredMedicamentos(data);
    } catch (error) {
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* Función para formatear el nombre del medicamento */
  const formatName = (text: string): string => {
    const clear = text.replace(/\s*[\(\[].*?[\)\]]\s*/g, " ").trim();
    return clear
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
          title="Medicamentos"
          showBack
          transparent
          showProfileIcon
          onLogout={() => setModalVisible(true)}
        />

        <View style={styles.contentContainer}>
          {/* Buscador */}
          <Buscador
            value={searchQuery}
            onChange={(text) => {
              setSearchQuery(text);
              const lowerText = text.toLowerCase();
              const filtered = medicamentos.filter((med) =>
                med.nombre.toLowerCase().includes(lowerText)
              );
              setFilteredMedicamentos(filtered);
            }}
            placeholder="Buscar medicamentos"
          />

          {filteredMedicamentos.length === 0 ? (
            <EmptyState message="No se encontraron medicamentos por el momento." />
          ) : (
            <FlatList
              data={filteredMedicamentos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent:
                  filteredMedicamentos.length === 0 ? "center" : "flex-start",
                paddingBottom: verticalScale(14),
              }}
              renderItem={({ item }) => {
                const fechaValida =
                  item.fechaVencimiento &&
                  !isNaN(new Date(item.fechaVencimiento).getTime());
                let dt: Date | null = null;
                if (fechaValida) dt = new Date(item.fechaVencimiento);

                return (
                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      {/* COLUMNA IZQUIERDA: FECHA DE VENCIMIENTO */}
                      <View style={styles.leftColumn}>
                        {fechaValida && dt ? (
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
                            style={{
                              color: "white",
                              textAlign: "center",
                              fontFamily: fonts.body,
                              fontSize: moderateScale(14),
                            }}
                          >
                            No{"\n"}Disponible
                          </Text>
                        )}
                      </View>

                      {/* COLUMNA DERECHA: DETALLES */}
                      <View style={styles.rightColumn}>
                        <Text style={styles.text}>
                          <Text style={styles.label}>Nombre: </Text>
                          <Text style={styles.text}>
                            {formatName(item.nombre)}
                          </Text>
                        </Text>
                        <Text style={styles.text}>
                          <Text style={styles.label}>Cantidad: </Text>
                          {item.cantidad}
                        </Text>
                        {item.presentacion &&
                          item.presentacion.toUpperCase() !== "NINGUNO" && (
                            <Text style={styles.text}>
                              <Text style={styles.label}>Presentación: </Text>
                              {capitalizeSentence(item.presentacion)}
                            </Text>
                          )}
                        {item.dias_tratamiento &&
                          item.dias_tratamiento !== 0 && (
                            <Text style={styles.text}>
                              <Text style={styles.label}>Días de tratamiento: </Text>
                              {item.dias_tratamiento} 
                            </Text>
                          )}
                          {item.indicaciones && item.indicaciones !== "" && (
                            <Text style={styles.text}>
                              <Text style={styles.label}>Indicaciones: </Text>
                              {capitalizeSentence(item.indicaciones)}
                            </Text>
                          )}
                      </View>
                    </View>
                    <View style={styles.iconWrapper}>
                      <Image
                        source={require("../../assets/icons/medicine.png")}
                        style={styles.icon}
                      />
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* Modal de Cerrar Sesión */}
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

const LEFT_COLUMN_WIDTH = scale(94);
const CARD_CONTENT_HEIGHT = verticalScale(180);
const ICON_SIZE = scale(34);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
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
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
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
    fontSize: verticalScale(17),
    color: colors.white,
    fontFamily: fonts.body,
    marginTop: verticalScale(4),
  },
  rightColumn: {
    flex: 1,
    padding: moderateScale(12),
    marginLeft: scale(12),
    marginRight: scale(10),
    justifyContent: "center",
    alignItems: "flex-start",
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
  icon: {
    width: scale(22),
    height: scale(22),
  },
});

export default MedicamentScreen;
