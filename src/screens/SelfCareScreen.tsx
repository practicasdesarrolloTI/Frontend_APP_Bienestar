import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { findriscSurvey } from "../data/findriscSurvey";
import { lawtonBrodySurvey } from "../data/lawtonBrodySurvey";
import { framinghamSurvey } from "../data/fragmiganSurvey";
import { moriskyGreenSurvey } from "../data/moriskyGreenSurvey";
import { getPatientAPP, getPatientByDocument } from "../services/patientService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calcularEdad } from "../utils/dateUtils";
import { getSurveyResultsByDocument } from "../services/surveyResultService";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
import SurveyCard from "../components/SurveyCard";
import Toast from "react-native-toast-message";
import { getRemainingTime } from "../utils/getRemainingTimeUtils";
import { fetchAutocuidado } from "../services/surveyService";
import CustomHeader from "../components/CustomHeader";
import WarningModal from "../components/WarningModal";
import SkeletonLoading from "../components/SkeletonLoading";

type ResultadoEncuesta = {
  surveyId: string;
  createdAt: string;
  updatedAt: string;
};

type Survey = {
  id: string;
  nombre: string;
  image?: string;
  descripcion: string;
  preguntas: (
    | {
      omitida: any;
      pregunta: string;
      opciones: { texto: string; valor: number; sexo: any }[];
      recomendaciones?: string;
    }
    | {
      omitida: any;
      pregunta: string;
      opciones: { texto: string; valor: number; sexo: any }[];
      recomendaciones?: string;
    }
  )[];
  requiereEdad: boolean;
  requiereSexo: boolean;
  requiredIMC: boolean;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Autocuidado"
>;
type Paciente = {
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
};

type PacienteRegistro = {
  _id: string;
  fechaNacimiento: string;
  eps: string;
  documentType: string;
  document: number;
  mail: string;
  password: string;
  firstName: string;
  middleName: string;
  firstSurname: string;
  middleLastName: string;
  createdAt: string;
  updatedAt: string;
  sexo: string;
};

const SelfCareScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [resultados, setResultados] = useState<ResultadoEncuesta[] | null>(
    null
  );
  const [Paciente, setPatient] = useState<Paciente | null>(null);
  const [PacienteRegistro, setPacienteRegistro] = useState<PacienteRegistro | null>(null);
  const [indicadores, setIndicadores] = useState<any>(null);
  const [encuestasListas, setEncuestasListas] = useState(false);
  const [estadoEncuestas, setEstadoEncuestas] = useState<
    Record<string, { bloqueada?: boolean; disponibleEn?: any }>
  >({});

  const [encuestas] = useState<Survey[]>([
    {
      ...findriscSurvey,
      requiereEdad: true,
      requiereSexo: true,
      requiredIMC: true,
      image: require("../../assets/icons/FINDRISC.png"),
    },
    {
      ...lawtonBrodySurvey,
      requiereEdad: false,
      requiereSexo: false,
      requiredIMC: false,
      image: require("../../assets/icons/Lawton-Brody.png"),
    },
    {
      ...framinghamSurvey,
      requiereEdad: true,
      requiereSexo: true,
      requiredIMC: false,
      image: require("../../assets/icons/Framingham.png"),
    },
    {
      ...moriskyGreenSurvey,
      requiereEdad: false,
      requiereSexo: false,
      requiredIMC: false,
      image: require("../../assets/icons/Morisky-Green.png"),
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
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

  const loadPatient = async () => {
    try {
      const storedDoc = await AsyncStorage.getItem("documento");
      const storedTipo = await AsyncStorage.getItem("tipoDocumento");
      if (!storedDoc || !storedTipo) {
        Toast.show({
          type: "error",
          text2: "No se encontró el documento del paciente.",
          position: "bottom",
        });
        return;
      }

      const pacienteRegistroData = await getPatientAPP(storedTipo, Number(storedDoc));
      setPacienteRegistro(pacienteRegistroData as unknown as PacienteRegistro);

      const data = await getPatientByDocument(storedDoc);
      setPatient(data as unknown as Paciente);

      const indicadoresData = await fetchAutocuidado(storedTipo, storedDoc);
      setIndicadores(indicadoresData);
    } catch (error) {
    }
  };

  const loadResultados = async () => {
    const storedDoc = await AsyncStorage.getItem("documento");
    const initialState: Record<string, any> = {};
    encuestas.forEach((encuesta) => {
      initialState[encuesta.id] = { bloqueada: false };
    });
    setEstadoEncuestas(initialState);
    if (!storedDoc) return;
    try {
      const data = await getSurveyResultsByDocument(storedDoc);
      setResultados(data as ResultadoEncuesta[]);
    } catch (error) {
      setResultados([]);
    }
  };

  useEffect(() => {
    loadPatient(), loadResultados();
  }, []);

  useEffect(() => {
    if (!encuestas.length || resultados === null) return;

    const nuevosEstados: Record<string, any> = {};

    encuestas.forEach((encuesta) => {
      const resultado = resultados.find((r) => r.surveyId === encuesta.id);

      if (!resultado) {
        nuevosEstados[encuesta.id] = { bloqueada: false };
      } else {
        const tiempoRestante = getRemainingTime(resultado.createdAt);
        nuevosEstados[encuesta.id] = {
          bloqueada: !tiempoRestante.completado,
          disponibleEn: tiempoRestante,
        };
      }
    });

    setEstadoEncuestas(nuevosEstados);
    setEncuestasListas(true);
  }, [encuestas, resultados]);

  const handleOpenSurvey = (survey: Survey) => {
    if (!Paciente && !PacienteRegistro) return Toast.show({
      type: "error",
      text2: "En el momento no se pueden realizar encuestas. Intentalo más tarde.",
      position: "bottom",
    });

    const estado = estadoEncuestas[survey.id];

    if (estado?.bloqueada) {
      const { meses, dias, horas } = estado?.disponibleEn || {};
      const partes: string[] = [];
      if (meses > 0) partes.push(`${meses} mes${meses > 1 ? "es" : ""}`);
      if (dias > 0) partes.push(`${dias} día${dias > 1 ? "s" : ""}`);
      if (horas > 0) partes.push(`${horas} hora${horas > 1 ? "s" : ""}`);

      Toast.show({
        type: "error",
        text1: "Encuesta realizada",
        text2: `Podrás volver a realizar esta encuesta en ${partes.join(
          " y "
        )}.`,
        position: "bottom",
      });
      return;
    }

    const edad = calcularEdad(Paciente?.fecha_nacimiento || PacienteRegistro?.fechaNacimiento || " ");
    const sexo = Paciente?.sexo || PacienteRegistro?.sexo || "Masculino";

    navigation.navigate("SurveyScreen", {
      surveyId: survey.id,
      preguntas: survey.preguntas,
      edad,
      sexo,
      survey,
      indicadores,
    });
  };

  const renderSurvey = (survey: Survey) => {
    const estado = estadoEncuestas[survey.id];

    if (!encuestasListas || !estado) {
      return (
        <SkeletonLoading
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            marginBottom: verticalScale(10),
          }}
          borderRadius={moderateScale(25)}
        />
      );
    }
    return (
      <SurveyCard
        key={survey.id}
        survey={{
          id: survey.id,
          nombre: survey.nombre,
          image: survey.image,
          descripcion: survey.descripcion,
          bloqueada: estado.bloqueada,
        }}
        tiempoRestante={estado.disponibleEn}
        onPress={() => handleOpenSurvey(survey)}
      />
    );
  };

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
          title="Autocuidado"
          showBack
          transparent
          showProfileIcon
          onLogout={() => setModalVisible(true)}
          goBackTo="Home"
        />

        <View style={styles.container}>
          <FlatList
            data={encuestas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderSurvey(item)}
            contentContainerStyle={{ paddingBottom: verticalScale(20) }}
          />
        </View>

        {/* Modal de Cerrar Sesión */}
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
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const ASPECT_RATIO = 340 / 280;
const CARD_HEIGHT = CARD_WIDTH / ASPECT_RATIO;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
  },
});

export default SelfCareScreen;
