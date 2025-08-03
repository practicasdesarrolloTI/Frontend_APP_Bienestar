import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { sendRecoveryCode } from "../services/authService";
import { checkPatient } from "../services/patientService"; // ya lo tienes
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import colors from "../themes/colors";
import { fonts } from "../themes/fonts";
import Toast from "react-native-toast-message";
import DocumentPicker from "../components/DocumentPicker";
import CustomHeader from "../components/CustomHeader";

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;
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

const ForgotPasswordScreen = ({
  navigation,
}: {
  navigation: ForgotPasswordScreenNavigationProp;
}) => {
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {    

    if (documentType === null) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Seleccione un tipo de documento.",
      });
      return;
    }

    if (!document) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese un número de documento.",
      });
      return;
    }
    if (!/^\d+$/.test(document)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El número de documento debe ser numérico.",
      });
      return;
    }

    const paciente = await checkPatient(
      documentType as DocumentType,
      Number(document)
    );
    const docPaciente = paciente?.document || null;
    const docType = paciente?.documentType || null;
    const correoPaciente = paciente?.mail;

    console.log("paciente", paciente);

     if (documentType !== docType) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "No se encontró el paciente con la información dada. Verifica los datos.",
      });
      return;
    }

    try {
      setIsLoading(true);
      setEmail(correoPaciente || "");
      const result = await sendRecoveryCode(
        Number(document),
        correoPaciente || ""
      );
      if (result.success) {
        console.log("Código enviado a:", correoPaciente);
        navigation.navigate("VerifyCode", {
          document: document,
          documentType: documentType as DocumentType,
          mail: correoPaciente || "",
          eps: paciente?.eps || "",
          fechaNacimiento: paciente?.fechaNacimiento || "",
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
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo enviar el código. Intenta nuevamente.",
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
        source={require("../../assets/backgrounds/Pregunta_cuestionario.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        {/* Header transparente */}
        <CustomHeader
          showBack={true}
          transparent={true}
          showProfileIcon={false}
          onLogout={() => {}}
        />
        <ScrollView
          contentContainerStyle={styles.container}
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
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa esta información para verificar la autenticidad de tu
              cuenta{" "}
            </Text>
          </View>
           <View style={styles.formContainer}>
          <DocumentPicker selected={documentType} onSelect={setDocumentType} />

          <TextInput
            style={styles.input}
            placeholder="Número de documento"
            placeholderTextColor={colors.lightGray}
            value={document}
            onChangeText={setDocument}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar Código</Text>
            )}
          </TouchableOpacity>
          </View>
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
  title: {
    fontSize: moderateScale(28),
    fontFamily: fonts.title,
    color: colors.preto,
    marginBottom: verticalScale(5),
  },
  subtitle: {
    fontSize: moderateScale(15),
    fontFamily: fonts.subtitle,
    color: colors.gray,
    textAlign: "center",
  },
  subheaderContainer: {
    marginBottom: verticalScale(30),
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: scale(90),
    height: verticalScale(75),
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
    justifyContent: "flex-start",
    alignItems: "center",
  },
  label: {
    fontSize: moderateScale(16),
    fontFamily: fonts.subtitle,
    color: colors.primary,
    marginBottom: verticalScale(10),
  },
  input: {
    width: scale(300),
    height: verticalScale(40),
    backgroundColor: colors.white,
    borderRadius: scale(8),
    paddingHorizontal: scale(15),
    color: colors.preto,
    fontSize: moderateScale(14),
    fontFamily: fonts.body,
  },
   formContainer: {
    gap: verticalScale(10),
  },
  button: {
    backgroundColor: colors.primary,
    width: scale(310),
    paddingVertical: verticalScale(15),
    borderRadius: scale(50),
    marginBottom: verticalScale(10),
    alignItems: "center",
    marginTop: verticalScale(25),
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: fonts.title,
  },
});

export default ForgotPasswordScreen;
