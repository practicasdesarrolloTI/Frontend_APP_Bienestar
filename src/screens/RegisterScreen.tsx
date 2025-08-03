import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Keyboard,
  ImageBackground,
  Image,
  Linking,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import colors from "../themes/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  checkPatient,
  checkPatientByMail,
  getPatientByDocument,
} from "../services/patientService";
import { MaterialIcons } from "@expo/vector-icons";
import { fonts } from "../themes/fonts";
import DocumentPicker from "../components/DocumentPicker";
import Toast from "react-native-toast-message";
import { sendRecoveryCode } from "../services/authService";
import CustomHeader from "../components/CustomHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchEps } from "../services/epsService";
import EpsPicker from "../components/EpsPicker";
import DatePickerField from "../components/DatePickerField";
import SexPicker from "../components/SexPicker";

type DocumentType =
  | "RC"
  | "TI"
  | "CC"
  | "CE"
  | "PAS"
  | "NIT"
  | "CD"
  | "SC"
  | "MSI"
  | "ASI"
  | "PEP"
  | "PTP";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const formatDateToString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // enero = 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [birthDate, setBirthDate] = useState<string | null>(null); // formato "DD/MM/AAAA"
  const [epsList, setEpsList] = useState<{ label: string; value: string }[]>(
    []
  );
  const [selectedEps, setSelectedEps] = useState<string | null>(null);
  const [selectedSex, setSelectedSex] = useState<"Masculino" | "Femenino" | null>(null);

  useEffect(() => {
    const loadEps = async () => {
      const data = await fetchEps();
      const options = data.map((eps: any) => ({
        label: eps.nombre,
        value: eps.nombre,
      }));
      setEpsList(options);
    };
    loadEps();
  }, []);

  const handleRegister = async () => {
    const paciente = await getPatientByDocument(documentNumber);
    const docPaciente = paciente?.documento || null;
    const docType = paciente?.tipo_documento_abreviado || null;
    const fechaNaci = paciente?.fecha_nacimiento || null;
    const EPS = paciente?.eps || null;
    const sexoPaciente = paciente?.sexo || null;

    console.log("Paciente:", paciente);
    console.log("Datos del paciente:", {
      docPaciente,
      docType,
      fechaNaci,
      EPS,
      sexoPaciente,
    });

    console.log("Datos ingresados:", {
      documentType,
      documentNumber,
      email,
      confirmEmail,
      selectedEps,
      birthDate,
      selectedSex,
    });

    if (!documentType) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Seleccione un tipo de documento.",
      });
      return;
    }

    if (!documentNumber) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese un número de documento.",
      });
      return;
    }
    if (!/^\d+$/.test(documentNumber || "")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El número de documento debe ser numérico.",
      });
      return;
    }
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese un correo electrónico.",
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese un correo electrónico válido.",
      });
      return;
    }
    if (email !== confirmEmail) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Los correos no coinciden.",
      });
      return;
    }

    if (!selectedEps) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese el nombre de su EPS.",
      });
      return;
    }

    if (!birthDate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese su fecha de nacimiento.",
      });
      return;
    }

    
    if (!selectedSex) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Seleccione su sexo.",
      });
      return;
    }

     if (!acceptedTerms) {
      Toast.show({
        type: "error",
        text1: "Términos no aceptados",
        text2: "Debes aceptar los términos y condiciones para continuar.",
      });
      return;
    }

    if (documentType !== docType) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "No se encontró el paciente con la información dada. Verifica los datos.",
      });
      return;
    }

    if (selectedEps !== EPS) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "No se encontró el paciente con la información dada. Verifica los datos.",
      });
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Formato de fecha inválido. Debe ser DD/MM/AAAA.",
      });
      return;
    }

    if (birthDate !== fechaNaci) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "No se encontró el paciente con la información dada. Verifica los datos.",
      });
      return;
    }

    if (selectedSex !== sexoPaciente) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "El sexo seleccionado no coincide con la información del paciente.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const patientExits = await checkPatient(
        documentType,
        Number(documentNumber)
      );

      await AsyncStorage.setItem("documento", documentNumber);
      await AsyncStorage.setItem("tipoDocumento", String(documentType));
      const patientByMail = await checkPatientByMail(email);
      if (patientByMail) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Correo ya registrado",
        });
        return;
      }
      if (patientExits) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Usuario ya registrado",
        });
        return;
      } else {
        const result = await sendRecoveryCode(Number(docPaciente), email);

        if (result.success) {
          navigation.navigate("VerifyCode", {
            document: documentNumber,
            documentType: documentType as DocumentType,
            mail: email,
            eps: selectedEps,
            fechaNacimiento: birthDate,
          });
        } else {
          if (result.retryAfterMinutes) {
            Toast.show({
              type: "error",
              text1: "Límite alcanzado",
              text2: `Intenta nuevamente en ${result.retryAfterMinutes} minuto(s)`,
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: result.message,
            });
          }
        }
      }
    } catch (error: any) {
      console.log(
        "Error en sendRecoveryCode:",
        error.response?.status,
        error.response?.data
      );

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <ImageBackground
        source={require("../../assets/backgrounds/Inicio_de_sesion2.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        {/* Header transparente */}
        <CustomHeader
          showBack={true}
          transparent={true}
          showProfileIcon={false}
          onLogout={() => {}}
          goBackTo="Landing"
        />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Subheader */}
          <View style={styles.subheaderContainer}>
            <Image
              source={require("../../assets/logos/LogoCuidarMe.png")}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={styles.title}>Registro</Text>
            <Text style={styles.subtitle}>
              Ingresa tus datos para registrarse
            </Text>
          </View>

          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              {/* Documento */}
              <View style={styles.formContainer}>
                <DocumentPicker
                  selected={documentType}
                  onSelect={setDocumentType}
                />

                {/*  Número de Documento */}
                <TextInput
                  style={styles.input}
                  placeholder="Número de documento"
                  placeholderTextColor={colors.lightGray}
                  keyboardType="numeric"
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                />

                {/*  Correo */}
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor={colors.lightGray}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => setEmail(text.toLowerCase())}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirmar correo electrónico"
                  placeholderTextColor={colors.lightGray}
                  keyboardType="email-address"
                  value={confirmEmail}
                  onChangeText={(text) => setConfirmEmail(text.toLowerCase())}
                />

                <View style={styles.rowContainer}>
                  {/* EPS */}
                  <EpsPicker
                    selected={selectedEps}
                    options={epsList}
                    onSelect={setSelectedEps}
                  />

                  {/* Fecha de nacimiento */}
                  <DatePickerField date={birthDate} onSelect={setBirthDate} />
                </View>

                {/* Sexo */}
                <SexPicker selected={selectedSex} onSelect={setSelectedSex} />
              </View>

              {/* Terminos y condiciones */}
      
                <View style={styles.termsContainer}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      onPress={() => setAcceptedTerms(!acceptedTerms)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={
                          acceptedTerms
                            ? "check-box"
                            : "check-box-outline-blank"
                        }
                        size={28}
                        color={colors.preto}
                      />
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>Acepto los </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(
                          "https://bienestarips.com/wp-content/uploads/2024/08/MA-GJ-002-Manual-de-Tratamiento-de-Datos-Personales.pdf"
                        )
                      }
                    >
                      <Text style={styles.termsText}>
                        términos y condiciones
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/*  Botón de Registro */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Continuar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginText}>
                    ¿Ya tienes cuenta?
                    <Text style={styles.loginLinkText}> Inicia sesión</Text>
                  </Text>
                </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: scale(15),
  },
  subheaderContainer: {
    alignItems: "center",
    marginBottom: verticalScale(5),
  },
  logo: {
    width: scale(85),
    height: verticalScale(70),
  },
  title: {
    fontSize: moderateScale(25),
    fontFamily: fonts.title,
    color: colors.preto,
    marginBottom: verticalScale(5),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
    color: colors.gray,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: moderateScale(20),
    justifyContent: "flex-start",
  },
  formContainer: {
    gap: verticalScale(8),
  },
  input: {
    width: scale(300),
    height: verticalScale(40),
    backgroundColor: colors.white,
    borderRadius: scale(8),
    paddingHorizontal: scale(15),
    color: colors.preto,
    fontSize: moderateScale(13),
    fontFamily: fonts.body,
  },
  termsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: scale(300),
    marginVertical: verticalScale(10),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: moderateScale(13),
    fontFamily: fonts.subtitle,
    color: colors.preto,
    marginLeft: scale(8),
  },
  termsText: {
    fontSize: moderateScale(13),
    fontFamily: fonts.subtitle,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: colors.primary,
    width: scale(300),
    paddingVertical: verticalScale(12),
    borderRadius: scale(50),
    marginBottom: verticalScale(10),
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(17),
    fontFamily: fonts.title,
  },
  loginText: {
    color: colors.accent,
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
  },
  loginLinkText: {
    color: colors.purple,
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
  },
  rowContainer: {
    flexDirection: "row",
    gap: scale(6),
  },

});
export default RegisterScreen;
