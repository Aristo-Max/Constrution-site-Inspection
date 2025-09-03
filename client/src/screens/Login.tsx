import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
// import Logo from "../assets/logo.png"; // Original logo import
import { Formik } from "formik";
import * as Yup from "yup";

// Import the centralized color palette
import colors from "../constants/color";

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust the path as necessary

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
  onLogin: () => void;
};

const { height } = Dimensions.get('window');

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = ({ navigation, onLogin }: LoginScreenProps) => {
  const handleLogin = (values: { email: string; password: string }) => {
    console.log("Email:", values.email);
    console.log("Password:", values.password);
    // TODO: Add API call for login here
  };

  // We are using a placeholder image since the original logo.png is not available.
  const logoPlaceholderUrl = "https://placehold.co/140x70/2C3E50/F39C12?text=SITE+INSPECT";

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        {/* Logo with construction site theme */}
        <Image source={{ uri: logoPlaceholderUrl }} style={styles.logo} />
      </View>

      <View style={styles.container}>
        {/* Title */}
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Please login to your account to continue your inspection.
        </Text>

        {/* Formik */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={onLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              {/* Email Input */}
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}       // 🔴 disables predictive text & suggestions
                autoComplete="off"      // ✅ tells system it's an email field (Android/iOS autofill)
                textContentType="emailAddress" // ✅ iOS autofill hint
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Password Input */}
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                autoCorrect={false}
                autoComplete="off"
                secureTextEntry
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Forgot Password */}
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        {/* Sign Up Link */}
        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLink}>SIGN UP</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.tertiary,
  },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    paddingTop: height * 0.05,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 40,
  },
  logo: {
    width: 140,
    height: 70,
    resizeMode: "contain",
    tintColor: colors.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: colors.primary,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 8,
    padding: 15,
    marginBottom: 5,
    backgroundColor: colors.tertiary,
    color: colors.primary,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: colors.primary,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  signupText: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  signupLink: {
    color: colors.secondary,
    fontWeight: "bold",
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 10,
  },
});

export default Login;
