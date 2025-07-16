import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  ImageBackground,
  Dimensions,
  Image,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import colors from "../themes/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchResults } from "../services/resultService";
import { fonts } from "../themes/fonts";
import LoadingScreen from "../components/LoadingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EmptyState from "../components/EmptyState";
import CustomHeader from "../components/CustomHeader";
import Toast from "react-native-toast-message";
import LogOutModal from "../components/WarningModal";
import Buscador from "../components/Buscador";

type Props = NativeStackScreenProps<RootStackParamList, "Resultados">;

type Resultado = {
  id: string;
  fechaRealizacion: string;
  examen: string;
  programa: string;
  medico_remisor: string;
};

const ResultsScreen: React.FC<Props> = ({ navigation }) => {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [resultadosFiltrados, setResultadosFiltrados] = useState<Resultado[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const noHayResultados =
    resultados.length === 0 || resultadosFiltrados.length === 0;
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
    const loadData = async () => {
      try {
        const tipo = await AsyncStorage.getItem("tipoDocumento");
        const doc = await AsyncStorage.getItem("documento");
        if (!tipo || !doc) throw new Error("Faltan datos del paciente");
        const data = await fetchResults(tipo, doc);
        setResultados(data);
        setResultadosFiltrados(data);
      } catch (error) {
        console.error("Error al cargar resultados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openLabResultsWeb = async () => {
    const url =
      "https://resultadoslaboratorio.bienestarips.com:8443/resultados/#nbb";
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Toast.show({
        type: "error",
        text2: "No se pudo abrir el enlace.",
      });
    }
  };

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
          title="Resultados"
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
              const filtered = resultados.filter((resultado) =>
                [resultado.examen, resultado.programa, resultado.medico_remisor]
                  .join(" ")
                  .toLowerCase()
                  .includes(lowerText)
              );
              setResultadosFiltrados(filtered);
            }}
            placeholder="Buscar resultados"
          />

          <FlatList
            data={resultadosFiltrados}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState message="No se encontraron resultados de momento" />
            }
            renderItem={({ item }) => {
              const fechaValida =
                item.fechaRealizacion &&
                !isNaN(new Date(item.fechaRealizacion).getTime());
              let dt: Date | null = null;
              if (fechaValida) {
                dt = new Date(item.fechaRealizacion);
              }
              return (
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    {/* COLUMNA IZQUIERDA: FECHA */}
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
                        <Text style={styles.label}>
                          {formatName(item.examen)}
                        </Text>
                      </Text>
                      {item.medico_remisor.trim().length > 0 && (
                        <Text style={styles.text}>
                          <Text style={styles.label}>Médico Remisor: </Text>
                          {capitalizeName(item.medico_remisor)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.iconWrapper}>
                    <Image
                      source={require("../../assets/icons/lab.png")}
                      style={styles.icon}
                    />
                  </View>
                </View>
              );
            }}
          />

          {/* Modal de Cerrar Sesión */}
          <LogOutModal
            text="¿Estás seguro de que deseas cerrar sesión?"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            onConfirm={handleLogout}
          />
        </View>

        {/* Botón fijo abajo */}
        <View style={styles.footerButtonContainer}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              noHayResultados && styles.footerButtonDisabled,
            ]}
            onPress={openLabResultsWeb}
            disabled={noHayResultados}
          >
            <Text style={styles.footerButtonText}>
              Consultar Resultados en la Web
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const LEFT_COLUMN_WIDTH = scale(96);
const CARD_CONTENT_HEIGHT = verticalScale(150);
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
    fontSize: verticalScale(18),
    color: colors.white,
    fontFamily: fonts.body,
    marginTop: verticalScale(4),
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
  rightColumn: {
    flex: 1,
    padding: moderateScale(12),
    marginLeft: scale(16),
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
    fontSize: verticalScale(12),
    fontFamily: fonts.title,
    color: colors.preto,
  },
  footerButtonContainer: {
    marginTop: verticalScale(10),
    paddingHorizontal: scale(25),
  },
  footerButton: {
    backgroundColor: colors.secondary,
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(50),
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  footerButtonDisabled: {
    backgroundColor: "#ccc",
  },
  footerButtonText: {
    color: colors.white,
    fontFamily: fonts.title,
    fontSize: verticalScale(14),
  },
});

export default ResultsScreen;
