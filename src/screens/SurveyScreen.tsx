import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";
import colors from "../themes/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { fonts } from "../themes/fonts";
import WarningModal from "../components/WarningModal";
import Toast from "react-native-toast-message";

type SurveyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SurveyScreen"
>;

type Respuesta =
  | string
  | {
      texto: string;
      valor: number;
    };

const SurveyScreen: React.FC<SurveyScreenProps> = ({ route }) => {
  const { preguntas, surveyId, edad, sexo, survey, indicadores } = route.params;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Respuesta[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>("");
  const [modalClosed, setModalClosed] = useState(false);

  const estatura = indicadores?.Altura / 100;
  const peso = indicadores?.Peso;

  const imc = peso && estatura ? peso / (estatura * estatura) : NaN;

  useEffect(() => {
    const resp = responses[currentIndex];
    if (resp && typeof resp === "object" && resp.valor !== undefined) {
      setSelectedOption(resp.valor);
    } else if (typeof resp === "string") {
      setSelectedOption(resp);
    } else {
      setSelectedOption("");
    }
  }, [currentIndex, responses]);

  // Filtrar preguntas omitidas
  let finalPreguntas = preguntas.filter((q) => {
    if (typeof q === "string") return false;

    const texto = q.pregunta.toLowerCase();
    const esAltura = /\b(estatura|altura)\b/.test(texto);
    const esIMC = /\bimc\b/.test(texto);
    const esEdad = /\bedad\b/.test(texto);
    const esPeso = /\bpeso\b/.test(texto);
    const esSistolica = /\bsistólica\b/.test(texto);
    const esDiastolica = /\bdiastólica\b/.test(texto);
    const esColesterol = /\bcolesterol\b/.test(texto);
    const esHDL = /\bhdl\b/.test(texto);
    const esPerimetro = /\b(circunferencia|perímetro abdominal)\b/.test(texto);

    if (esAltura && indicadores?.Altura) return false;
    if (esEdad && edad) return false;
    if (esIMC && imc) return false;
    if (esPeso && indicadores?.Peso) return false;
    if (esSistolica && indicadores?.Tension_Arterial_Sistolica) return false;
    if (esDiastolica && indicadores?.Tension_Arterial_Diastolica) return false;
    if (esColesterol && indicadores?.Colesterol_Total) return false;
    if (esHDL && indicadores?.HDL) return false;
    if (esPerimetro && indicadores?.Perimetro_Abdominal) return false;

    return !q.omitida;
  });

  if (survey.requiredIMC) {
    finalPreguntas = [...finalPreguntas];
  }
  const totalQuestions = finalPreguntas.length;

  const handleNext = () => {
    const response = responses[currentIndex];

    // Validar campo numérico
    if (
      response === undefined ||
      (typeof response === "string" && response === "")
    ) {
      const parsed = parseFloat(response?.replace?.(",", "."));
      if (
        response === undefined ||
        response === "" ||
        isNaN(parsed) ||
        parsed < 1 ||
        parsed > 999
      ) {
        Toast.show({
          type: "error",
          text2: "Por favor ingresa un valor válido entre 1 y 999.",
          position: "bottom",
        });
        return;
      }
    } else {
      // Validar selección
      if (response === undefined || response === "") {
        Alert.alert("Error", "Por favor selecciona una opción.");
        return;
      }
    }

    // Avanzar
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      let respuestasExtra: Respuesta[] = [];

      if (edad && surveyId === "findrisc") {
        if (edad < 45) {
          respuestasExtra.push({ texto: "Menos de 45 años", valor: 0 });
        } else if (edad >= 45 && edad <= 54) {
          respuestasExtra.push({ texto: "Entre 45-54 años", valor: 2 });
        } else if (edad >= 55 && edad <= 64) {
          respuestasExtra.push({ texto: "Entre 55-64 años", valor: 3 });
        } else if (edad > 64) {
          respuestasExtra.push({ texto: "Mas de 64 años", valor: 4 });
        }
      }

      if (edad && surveyId === "framingham") {
        if (sexo === "Masculino") {
          if (edad >= 30 && edad <= 34) {
            respuestasExtra.push({ texto: "Entre 30-34 años", valor: -1 });
          } else if (edad >= 35 && edad <= 39) {
            respuestasExtra.push({ texto: "Entre 35-39 años", valor: 0 });
          } else if (edad >= 40 && edad <= 44) {
            respuestasExtra.push({ texto: "Entre 40-44 años", valor: 1 });
          } else if (edad >= 45 && edad <= 49) {
            respuestasExtra.push({ texto: "Entre 45-49 años", valor: 2 });
          } else if (edad >= 50 && edad <= 54) {
            respuestasExtra.push({ texto: "Entre 50-54 años", valor: 3 });
          } else if (edad >= 55 && edad <= 59) {
            respuestasExtra.push({ texto: "Entre 55-59 años", valor: 4 });
          } else if (edad >= 60 && edad <= 64) {
            respuestasExtra.push({ texto: "Entre 60-64 años", valor: 5 });
          } else if (edad >= 65 && edad <= 69) {
            respuestasExtra.push({ texto: "Entre 65-69 años", valor: 6 });
          } else if (edad >= 70 && edad <= 74) {
            respuestasExtra.push({ texto: "Entre 70-74 años", valor: 7 });
          }
        } else if (sexo === "Femenino") {
          if (edad >= 30 && edad <= 34) {
            respuestasExtra.push({ texto: "Entre 30-34 años", valor: -9 });
          } else if (edad >= 35 && edad <= 39) {
            respuestasExtra.push({ texto: "Entre 35-39 años", valor: -4 });
          } else if (edad >= 40 && edad <= 44) {
            respuestasExtra.push({ texto: "Entre 40-44 años", valor: 0 });
          } else if (edad >= 45 && edad <= 49) {
            respuestasExtra.push({ texto: "Entre 45-49 años", valor: 3 });
          } else if (edad >= 50 && edad <= 54) {
            respuestasExtra.push({ texto: "Entre 50-54 años", valor: 6 });
          } else if (edad >= 55 && edad <= 59) {
            respuestasExtra.push({ texto: "Entre 55-59 años", valor: 7 });
          } else if (edad >= 60 && edad <= 64) {
            respuestasExtra.push({ texto: "Entre 60-64 años", valor: 8 });
          } else if (edad >= 65 && edad <= 69) {
            respuestasExtra.push({ texto: "Entre 65-69 años", valor: 8 });
          } else if (edad >= 70 && edad <= 74) {
            respuestasExtra.push({ texto: "Entre 70-74 años", valor: 8 });
          }
        }
      }

      if (imc && surveyId === "findrisc") {
        if (imc < 25)
          respuestasExtra.push({ texto: "Menos de 25 kg/m2", valor: 0 });
        if (imc >= 25 && imc <= 30)
          respuestasExtra.push({ texto: "Entre 25-30 kg/m2", valor: 1 });
        if (imc > 30)
          respuestasExtra.push({ texto: "Mas de 30 kg/m2", valor: 3 });
      }

      if (indicadores?.Perimetro_Abdominal && surveyId === "findrisc") {
        const p = indicadores.Perimetro_Abdominal;
        if (sexo === "Masculino") {
          if (p < 94) respuestasExtra.push({ texto: "< 94cm", valor: 0 });
          else if (p <= 102)
            respuestasExtra.push({ texto: "94-102cm", valor: 3 });
          else respuestasExtra.push({ texto: ">102cm", valor: 4 });
        } else {
          if (p < 80) respuestasExtra.push({ texto: "< 80cm", valor: 0 });
          else if (p <= 88)
            respuestasExtra.push({ texto: "80-88cm", valor: 3 });
          else respuestasExtra.push({ texto: ">88cm", valor: 4 });
        }
      }

      if (indicadores?.HDL && surveyId === "framingham") {
        const hdl = indicadores.HDL;
        if (sexo === "Masculino") {
          if (hdl < 35) respuestasExtra.push({ texto: "Menor a 35", valor: 2 });
          else if (hdl >= 35 && hdl <= 44)
            respuestasExtra.push({ texto: "Entre 35-44", valor: 1 });
          else if (hdl >= 45 && hdl <= 49)
            respuestasExtra.push({ texto: "Entre 45-49", valor: 0 });
          else if (hdl >= 50 && hdl <= 59)
            respuestasExtra.push({ texto: "Entre 50-59", valor: 0 });
          else if (hdl > 60)
            respuestasExtra.push({ texto: "Mayor a 60", valor: -2 });
        }

        if (sexo === "Femenino") {
          if (hdl < 35) respuestasExtra.push({ texto: "Menor a 35", valor: 5 });
          else if (hdl >= 35 && hdl <= 44)
            respuestasExtra.push({ texto: "Entre 35-44", valor: 2 });
          else if (hdl >= 45 && hdl <= 49)
            respuestasExtra.push({ texto: "Entre 45-49", valor: 1 });
          else if (hdl >= 50 && hdl <= 59)
            respuestasExtra.push({ texto: "Entre 50-59", valor: 0 });
          else if (hdl > 60)
            respuestasExtra.push({ texto: "Mayor a 60", valor: -3 });
        }
      }

      if (indicadores?.Colesterol_Total && surveyId === "framingham") {
        const colesterol = indicadores?.Colesterol_Total;
        if (sexo === "Masculino") {
          if (colesterol < 160)
            respuestasExtra.push({ texto: "Menor a 160", valor: -3 });
          else if (colesterol >= 160 && colesterol <= 199)
            respuestasExtra.push({ texto: "Entre 160-199", valor: 0 });
          else if (colesterol >= 200 && colesterol <= 239)
            respuestasExtra.push({ texto: "Entre 200-239", valor: 1 });
          else if (colesterol >= 240 && colesterol <= 279)
            respuestasExtra.push({ texto: "Entre 240-279", valor: 2 });
          else if (colesterol > 280)
            respuestasExtra.push({ texto: "Mayor a 280", valor: 3 });
        }

        if (sexo === "Femenino") {
          if (colesterol < 160)
            respuestasExtra.push({ texto: "Menor a 160", valor: -2 });
          else if (colesterol >= 160 && colesterol <= 199)
            respuestasExtra.push({ texto: "Entre 160-199", valor: 0 });
          else if (colesterol >= 200 && colesterol <= 239)
            respuestasExtra.push({ texto: "Entre 200-239", valor: 1 });
          else if (colesterol >= 240 && colesterol <= 279)
            respuestasExtra.push({ texto: "Entre 240-279", valor: 1 });
          else if (colesterol > 280)
            respuestasExtra.push({ texto: "Mayor a 280", valor: 3 });
        }
      }

      if (
        indicadores?.Tension_Arterial_Sistolica &&
        surveyId === "framingham"
      ) {
        const tension = indicadores?.Tension_Arterial_Sistolica;
        if (sexo === "Masculino") {
          if (tension < 120)
            respuestasExtra.push({ texto: "Menor a 120", valor: 0 });
          else if (tension >= 120 && tension <= 129)
            respuestasExtra.push({ texto: "Entre 120-129", valor: 0 });
          else if (tension >= 130 && tension <= 139)
            respuestasExtra.push({ texto: "Entre 130-139", valor: 1 });
          else if (tension >= 140 && tension <= 159)
            respuestasExtra.push({ texto: "Entre 140-159", valor: 2 });
          else if (tension > 160)
            respuestasExtra.push({ texto: "Mayor a 160", valor: 3 });
        }
        if (sexo === "Femenino") {
          if (tension < 120)
            respuestasExtra.push({ texto: "Menor a 120", valor: -3 });
          else if (tension >= 120 && tension <= 129)
            respuestasExtra.push({ texto: "Entre 120-129", valor: 0 });
          else if (tension >= 130 && tension <= 139)
            respuestasExtra.push({ texto: "Entre 130-139", valor: 0 });
          else if (tension >= 140 && tension <= 159)
            respuestasExtra.push({ texto: "Entre 140-159", valor: 2 });
          else if (tension > 160)
            respuestasExtra.push({ texto: "Mayor a 160", valor: 3 });
        }
      }

      const puntajeTotal =
        surveyId === "moriskyGreen"
          ? responses.every((r, i) => {
              if (typeof r === "object") {
                if (i === 0 && r.texto !== "No") return false;
                if (i === 1 && r.texto !== "Sí") return false;
                if (i === 2 && r.texto !== "No") return false;
                if (i === 3 && r.texto !== "No") return false;
              }
              return true;
            })
            ? 1
            : 0
          : [...respuestasExtra, ...responses].reduce((acc, r) => {
              if (typeof r === "object" && r.valor !== undefined) {
                return acc + r.valor;
              }
              return acc;
            }, 0);

      // Combinar respuestas manuales y automáticas (omitidas)
      const allResponses = [
        ...respuestasExtra
          .filter(
            (r): r is { texto: string; valor: number } =>
              typeof r === "object" && r !== null && "texto" in r
          )
          .map((r) => r.texto),
        ...responses.map((r) => (typeof r === "string" ? r : r.texto)),
      ];

      navigation.navigate("SurveySummary", {
        surveyId,
        responses: allResponses,
        puntaje: puntajeTotal,
        edad,
        sexo,
        survey,
        indicadores,
        imc,
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleResponseChange = (
    respuesta: string | { texto: string; valor: number }
  ) => {
    const updated = [...responses];
    updated[currentIndex] = respuesta;
    setResponses(updated);

    if (typeof respuesta === "object") {
      setSelectedOption(respuesta.valor); // para texto libre (ej: peso)
    } else {
      setSelectedOption(respuesta); // para opciones con puntaje
    }
  };
  const renderQuestion = () => {
    const currentQuestion = finalPreguntas[currentIndex];
    const rawValue = responses[currentIndex] ?? "";

    if (!currentQuestion.opciones || currentQuestion.opciones.length === 0) {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{currentQuestion.pregunta}</Text>
          <TextInput
            style={styles.input}
            value={rawValue.toString()}
            onChangeText={(text) => {
              setResponses((prev) => {
                const updated = [...prev];
                updated[currentIndex] = text;
                return updated;
              });
            }}
            placeholder="0.0"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            textAlign="center"
          />
        </View>
      );
    }

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{currentQuestion.pregunta}</Text>
        <View style={styles.optionContainer}>
          {currentQuestion.opciones
            .filter(
              (op) => !op.sexo || op.sexo.toLowerCase() === sexo.toLowerCase()
            )
            .map((op, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === op.valor && styles.selectedOption,
                ]}
                onPress={() =>
                  handleResponseChange({ texto: op.texto, valor: op.valor })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === op.valor && styles.selectedOptionText,
                  ]}
                >
                  {op.texto}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    );
  };

  const progressPercentage = (currentIndex + 1) / totalQuestions;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <ImageBackground
        source={require("../../assets/backgrounds/Pregunta_cuestionario.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePrevious}
            >
              <Image
                source={require("../../assets/icons/atras.png")}
                style={{ width: moderateScale(24), height: moderateScale(24) }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <View style={styles.closeButton}>
            <TouchableOpacity onPress={() => setModalClosed(true)}>
              <MaterialIcons
                name="close"
                size={moderateScale(28)}
                color={colors.preto}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.subheader}>
          <Image
            source={require("../../assets/logos/LogoCuidarMe.png")}
            resizeMode="contain"
            style={styles.logo}
          />

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.pagination}>
            Pregunta {currentIndex + 1} de {totalQuestions}
          </Text>
          {renderQuestion()}

          <View style={styles.buttonContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={styles.previousButton}
                onPress={handlePrevious}
              >
                <Text style={styles.nextButtonText}>Volver</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex < totalQuestions - 1 ? "Siguiente" : "Finalizar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <WarningModal
          text="¿Estás seguro de que quieres abandonar esta encuesta?"
          visible={modalClosed}
          onCancel={() => setModalClosed(false)}
          onConfirm={() => navigation.navigate("SelfCareScreen")}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.1;
const SUBHEADER_HEIGHT = SCREEN_HEIGHT * 0.12;
const HORIZONTAL_PADDING = scale(20);
const VERTICAL_PADDING = verticalScale(10);
const PROGRESS_BAR_HEIGHT = verticalScale(6);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    width: "100%",
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  subheader: {
    width: "100%",
    flexDirection: "column",
    height: SUBHEADER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  logo: {
    width: SCREEN_WIDTH * 0.25,
    height: verticalScale(40),
    marginBottom: verticalScale(10),
  },
  progressBarBackground: {
    width: "50%",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: VERTICAL_PADDING,
  },
  pagination: {
    fontFamily: fonts.body,
    fontSize: moderateScale(15),
    marginBottom: verticalScale(2),
  },
  questionContainer: {
    height: verticalScale(300),
   
  },
  question: {
    fontSize: moderateScale(20),
    color: colors.preto,
    textAlign: "left",
    fontFamily: fonts.title,
    marginBottom: verticalScale(15),
  },
  input: {
    width: scale(80),
    height: verticalScale(45),
    borderColor: colors.lightGray,
    borderRadius: moderateScale(8),
    padding: moderateScale(8),
    fontSize: moderateScale(16),
    textAlign: "center",
    fontFamily: fonts.body,
    marginTop: verticalScale(10),
  },
  optionContainer: {
    flexDirection: "column",
    width: "100%",
    marginVertical: verticalScale(15),
    justifyContent: "center",
    alignItems: "center",
    rowGap: verticalScale(10),
  },
  optionButton: {
    width: "100%",
    paddingVertical: verticalScale(10),
    backgroundColor: colors.white,
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  selectedOptionText: {
    color: colors.white,
  },
  optionText: {
    color: colors.preto,
    fontSize: moderateScale(15),
    fontFamily: fonts.subtitle,
  },
  buttonContainer: {
    flexDirection: "column",
    marginTop: verticalScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  previousButton: {
    backgroundColor: colors.secondary,
    width: scale(250),
    paddingVertical: verticalScale(11),
    borderRadius: scale(50),
    marginBottom: verticalScale(10),
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: colors.primary,
    width: scale(250),
    paddingVertical: verticalScale(11),
    borderRadius: scale(50),
    marginBottom: verticalScale(10),
    alignItems: "center",
  },
  nextButtonText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: fonts.title,
  },
});
export default SurveyScreen;
