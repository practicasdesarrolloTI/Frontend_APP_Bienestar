import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { resetPassword } from "../services/authService";
import colors from "../themes/colors";
import { fonts } from "../themes/fonts";
import { MaterialIcons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import Toast from "react-native-toast-message";
import { checkPatient, getPatientByDocument } from "../services/patientService";
import { registerUser } from "../services/authService";
import CustomHeader from "../components/CustomHeader";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = StackScreenProps<RootStackParamList, "ResetPassword">;

const ResetPasswordScreen = ({ route, navigation }: Props) => {
  const { document, documentType, mail, value, eps, fechaNacimiento } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNewPassword = async () => {
    const patient = await getPatientByDocument(document);
    const patientExists = await checkPatient(documentType, Number(document));

    if (patientExists === null) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.",
          position: "bottom",
        });
        return;
      } else if (password !== confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Las contraseñas no coinciden.",
          position: "bottom",
        });
        return;
      }
      if (documentType) {
        await registerUser(documentType, Number(document), mail, password, eps, fechaNacimiento);
        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: "Usuario registrado correctamente.",
          position: "bottom",
        });
        navigation.replace("Home");
      }
    } else {
      if (!patient) {
        return Alert.alert("Error", "El documento no existe.");
      }
      try {
        setIsLoading(true);
        await resetPassword(Number(document), value, password);
        Toast.show({
          type: "success",
          text2: "Tu contraseña ha sido restablecida.",
          position: "bottom",
        });
        navigation.replace("Login");
      } catch (error) {
        Toast.show({
          type: "error",
          text1: value,
          text2: "No se pudo cambiar la contraseña.",
          position: "bottom",
        });
      } finally {
        setIsLoading(false);
      }
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
          onLogout={() => { }}
        />

        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {/* Subheader */}
            <View style={styles.subheaderContainer}>
              <Image
                source={require("../../assets/logos/LogoCuidarMe.png")}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.title}>Nueva contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa tu nueva contraseña{" "}
              </Text>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputPassword, { flex: 1 }]}
                placeholder="Nueva contraseña"
                placeholderTextColor={colors.preto}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  const regex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
                  setPasswordValid(regex.test(text));
                  setPasswordsMatch(text === confirmPassword);
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  color={"#bfbfbf"}
                  style={{ marginRight: 15 }}
                  size={moderateScale(22)}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputPassword, { flex: 1 }]}
                placeholder="Confirmar contraseña"
                placeholderTextColor={colors.preto}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setPasswordsMatch(password === text);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? "visibility-off" : "visibility"}
                  size={25}
                  color={"#bfbfbf"}
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.warning}>
              <Text
                style={[
                  styles.warningText,
                  { opacity: !passwordValid && password.length > 0 ? 1 : 0 },
                ]}
              >
                La contraseña debe tener entre 8 y 12 caracteres, una mayúscula,
                una minúscula y un número.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleNewPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
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
  subheaderContainer: {
    marginBottom: verticalScale(50),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(20),
  },
  title: {
    fontSize: moderateScale(26),
    fontFamily: fonts.title,
    color: colors.preto,
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontFamily: fonts.subtitle,
    color: colors.primary,
    textAlign: "center",
    lineHeight: verticalScale(22),
    paddingHorizontal: scale(20),
  },
  logo: {
    width: scale(90),
    height: verticalScale(75),
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: scale(20),
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
  warning: {
    marginBottom: verticalScale(10),
    alignItems: "center",
  },
  warningText: {
    color: colors.secondary,
    fontSize: moderateScale(14),
    fontFamily: fonts.body,
  },
  button: {
    backgroundColor: colors.primary,
    width: scale(310),
    paddingVertical: verticalScale(15),
    borderRadius: scale(50),
    marginBottom: verticalScale(10),
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: fonts.title,
  },

});

export default ResetPasswordScreen;
