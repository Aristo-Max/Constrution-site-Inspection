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
import { Formik } from "formik";
import * as Yup from "yup";

// Import the centralized color palette
import colors from "../constants/color";

const { height } = Dimensions.get('window');

const SignUpSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const Signup = () => {
  // We are using a placeholder image to match the login screen
  const logoPlaceholderUrl = "https://placehold.co/140x70/2C3E50/F39C12?text=SITE+INSPECT";

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        {/* Logo with construction site theme */}
        <Image source={{ uri: logoPlaceholderUrl }} style={styles.logo} />
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Sign up to start your site inspections.
        </Text>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={SignUpSchema}
          onSubmit={(values) => {
            console.log(values);
            // API call for signup here
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={colors.textSecondary}
                onChangeText={handleChange("firstName")}
                onBlur={handleBlur("firstName")}
                value={values.firstName}
              />
              {errors.firstName && touched.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor={colors.textSecondary}
                onChangeText={handleChange("lastName")}
                onBlur={handleBlur("lastName")}
                value={values.lastName}
              />
              {errors.lastName && touched.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
              />
              {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
              />
              {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                value={values.confirmPassword}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>SIGN UP</Text>
              </TouchableOpacity>

              <Text style={styles.footer}>
                Already a member?{" "}
                <Text
                  style={styles.login}
                  // onPress={() => navigation.navigate("Login")}
                >
                  LOGIN
                </Text>
              </Text>
            </>
          )}
        </Formik>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
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
    marginBottom: 10,
    backgroundColor: colors.tertiary,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 5,
  },
  footer: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
    color: colors.textSecondary,
  },
  login: {
    color: colors.secondary,
    fontWeight: "bold",
  },
});

export default Signup;
