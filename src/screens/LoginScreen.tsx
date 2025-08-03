import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Keyboard,
  Pressable,
  ImageBackground,
  Image,
  Linking,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import colors from "../themes/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { loginUser } from "../services/authService";
import { Snackbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { fonts } from "../themes/fonts";
import DocumentPicker from "../components/DocumentPicker";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native";
import CustomHeader from "../components/CustomHeader";

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
type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!document || !password || documentType === null) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Por favor completa todos los campos.",
        position: "bottom",
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
    if (!acceptedTerms) {
      Toast.show({
        type: "error",
        text1: "Términos no aceptados",
        text2: "Debes aceptar los términos y condiciones para continuar.",
        position: "bottom",
      });
      return;
    }

    const passwordRegex = /^[a-zA-Z0-9]{2,20}$/;
    if (!passwordRegex.test(password)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "La contraseña debe ser alfanumérica y tener entre 4 y 12 caracteres.",
        position: "bottom",
      });
      setVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      const result = await loginUser(documentType, Number(document), password);

      await AsyncStorage.setItem("documento", document);
      await AsyncStorage.setItem("tipoDocumento", String(documentType));

      if (!result.success) {
        setFailedAttempts((prev) => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            setIsBlocked(true);
            Toast.show({
              type: "error",
              text1: "Acceso bloqueado",
              text2: "Has superado el límite de intentos.",
              position: "bottom",
              visibilityTime: 3000,
            });
          }
          return newCount;
        });
      } else {
        setTimeout(() => navigation.replace("Home"));
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ocurrió un error al iniciar sesión.",
        position: "bottom",
        visibilityTime: 3000,
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
          <View style={styles.subheaderContainer}>
            <Image
              source={require("../../assets/logos/LogoCuidarMe.png")}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={styles.title}>Inicio de sesión</Text>
            <Text style={styles.subtitle}>
              Ingresa tus datos para inicar sesión
            </Text>
          </View>

          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formContainer}>
                <DocumentPicker
                  selected={documentType}
                  onSelect={setDocumentType}
                />

                {/* Documento */}
                <TextInput
                  style={styles.input}
                  placeholder="Número de documento"
                  placeholderTextColor={colors.lightGray}
                  value={document}
                  onChangeText={setDocument}
                  keyboardType="numeric"
                />

                {/* Contraseña */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.inputPassword}
                    placeholder="Contraseña"
                    placeholderTextColor={colors.lightGray}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility-off" : "visibility"}
                      style={{ marginRight: 15 }}
                      size={moderateScale(22)}
                      color={"#bfbfbf"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.forgotText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
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
                        acceptedTerms ? "check-box" : "check-box-outline-blank"
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
                    <Text style={styles.termsText}>términos y condiciones</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginText}>Iniciar sesión</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>
                  ¿No tienes cuenta?{" "}
                  <Text style={styles.register}>Regístrate</Text>
                </Text>
              </TouchableOpacity>

              <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                duration={2000}
              >
                {message}
              </Snackbar>
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
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight : verticalScale(20),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(15),
  },
  subheaderContainer: {
    alignItems: "center",
    marginBottom: verticalScale(15),
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
  passwordContainer: {
    width: scale(300),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: scale(8),
    marginBottom: verticalScale(10),
  },
  inputPassword: {
    flex: 1,
    height: verticalScale(40),
    paddingHorizontal: scale(15),
    color: colors.preto,
    fontSize: moderateScale(14),
    fontFamily: fonts.body,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(20),
  },
  forgotText: {
    color: colors.accent,
    fontSize: moderateScale(12),
    fontFamily: fonts.subtitle,
  },
  termsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: scale(300),
    marginBottom: verticalScale(15),
    marginTop: verticalScale(10),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
    color: colors.preto,
    marginLeft: scale(8),
  },
  termsText: {
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: colors.primary,
    width: scale(300),
    paddingVertical: verticalScale(12),
    borderRadius: scale(50),
    marginBottom: verticalScale(10),
    alignItems: "center",
  },
  loginText: {
    color: colors.white,
    fontSize: moderateScale(17),
    fontFamily: fonts.title,
  },
  registerText: {
    color: colors.accent,
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
  },
  register: {
    color: colors.purple,
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
  },
});
export default LoginScreen;
