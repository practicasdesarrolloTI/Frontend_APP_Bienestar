import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import colors from "../themes/colors";
import { fonts } from "../themes/fonts";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type Props = {
  nombre: string;
  sexo: string;
  onLogout: () => void;
};

type RootStackParamList = {
  Informacion: undefined;
};

const HomeHeader: React.FC<Props> = ({ nombre, sexo, onLogout }) => {
  const saludo = sexo === "Femenino" ? "¡Bienvenida!" : "¡Bienvenido!";
  const [menuVisible, setMenuVisible] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const capitalize = (text: string) =>
    text
      .toLowerCase()
      .split(" ")
      .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");

  return (
    <View style={styles.header}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.saludo}>{saludo}</Text>
          <Text style={styles.nombre}>{capitalize(nombre)}</Text>
        </View>

        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <Image
              source={require("../../assets/icons/perfil.png")}
              style={{ width: scale(22), height: scale(22) }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.inlineMenu}>
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Informacion");
                }}
              >
                <Text style={styles.menuItem}>Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  onLogout();
                }}
              >
                <Text style={styles.menuItem}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: verticalScale(80),
    paddingTop:
      Platform.OS === "android" ? verticalScale(20) : verticalScale(25),
    paddingHorizontal: scale(20),
    // paddingBottom: verticalScale(12),
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flex: 1,
  },
  saludo: {
    fontSize: moderateScale(15),
    fontFamily: fonts.body,
    color: colors.preto,
  },
  nombre: {
    fontSize: moderateScale(17),
    fontFamily: fonts.title,
    marginRight: scale(15),
    color: colors.preto,
  },
  profileWrapper: {
    position: "relative",
  },
  profileIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(50),
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.preto,
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.2,
    shadowRadius: verticalScale(2),
  },
  icon: {
    width: scale(24),
    height: scale(24),
  },
  inlineMenu: {
    position: "absolute",
    top: verticalScale(45),
    right: 0,
    width: scale(125),
    backgroundColor: colors.white,
    borderRadius: scale(8),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    shadowColor: colors.preto,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.2,
    shadowRadius: verticalScale(3),
    elevation: 5,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: verticalScale(6),
    fontSize: moderateScale(14),
    fontFamily: fonts.subtitle,
    color: colors.preto,
  },
});

export default HomeHeader;
