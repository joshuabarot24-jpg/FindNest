import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];

export default function ReportFoundScreen({ navigation }: any) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setPhotoError(false);
    }
  };

  const handleSubmit = () => {
    if (!itemName) return;
    if (!photo) {
      setPhotoError(true);
      return;
    }
    setPhotoError(false);
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require("../assets/icon.png")} style={styles.logoSmall} />
          <Text style={styles.brandText}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
          <Text style={styles.iconText}>🛠️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {submitted ? (
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <Text style={styles.successIcon}>🎉</Text>
            </View>
            <Text style={styles.successTitle}>Thank You!</Text>
            <Text style={styles.successMessage}>
              Please surrender the item to the school office to complete the process.
            </Text>

            <View style={styles.reminderBox}>
              <Text style={styles.reminderText}>
                Surrender this item to Ms. Shelly S. Durban within 2 school days, or the post will be automatically rejected.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.successButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.pageTitle}>Report Found Item</Text>
            <Text style={styles.pageSubtitle}>
              Help reunite this item with its owner
            </Text>

            <Text style={styles.label}>
              Upload Photo <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.uploadBox, photoError && styles.uploadBoxError]}
              onPress={pickImage}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.previewImage} />
              ) : (
                <>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={[styles.uploadText, photoError && styles.uploadTextError]}>
                    Choose File
                  </Text>
                  <Text style={[styles.uploadSubtext, photoError && styles.uploadSubtextError]}>
                    No file chosen
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {photoError && (
              <Text style={styles.errorText}>
                A photo is required before you can submit this report.
              </Text>
            )}

            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Scientific Calculator"
              placeholderTextColor="#9ca3af"
              value={itemName}
              onChangeText={setItemName}
            />

            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={styles.selectText}>{category}</Text>
              <Text style={styles.selectArrow}>⌄</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Location Found</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Library, Canteen, Room 402"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any details that might help identify the owner"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />

            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                This report is private and visible only to you and administrators!
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, !itemName && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!itemName}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.categoryOption}
                onPress={() => {
                  setCategory(item);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  category === item && styles.categoryOptionTextActive
                ]}>
                  {item}
                </Text>
                {category === item && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const NAVY = "#1a237e";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoSmall: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  brandText: {
    fontSize: 16,
    fontWeight: "900",
    color: NAVY,
  },
  brandAccent: {
    color: "#c99700",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: NAVY,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: "#9ca3af",
    marginBottom: 22,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  requiredMark: {
    color: "#ef4444",
  },
  uploadBox: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 26,
    alignItems: "center",
    marginBottom: 8,
  },
  uploadBoxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  uploadIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#374151",
  },
  uploadTextError: {
    color: "#ef4444",
  },
  uploadSubtext: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 3,
  },
  uploadSubtextError: {
    color: "#f87171",
  },
  errorText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#ef4444",
    marginBottom: 14,
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 13.5,
    color: "#374151",
    marginBottom: 16,
  },
  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  selectText: {
    fontSize: 13.5,
    color: "#374151",
    fontWeight: "600",
  },
  selectArrow: {
    fontSize: 18,
    color: "#9ca3af",
  },
  textArea: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    fontSize: 13.5,
    color: "#374151",
    minHeight: 100,
    marginBottom: 16,
  },
  privacyNote: {
    flexDirection: "row",
    backgroundColor: "#f5f3ff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  privacyIcon: {
    fontSize: 16,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: "#6d28d9",
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: "#22c55e",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#bbf7d0",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },
  successCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginTop: 40,
  },
  successIconBox: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 30,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: NAVY,
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 18,
  },
  reminderBox: {
    flexDirection: "row",
    backgroundColor: "#fff7ed",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  reminderText: {
    flex: 1,
    fontSize: 11.5,
    color: "#c2410c",
    lineHeight: 16,
  },
  successButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,19,63,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e7eb",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: NAVY,
    textAlign: "center",
    marginBottom: 16,
  },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  categoryOptionTextActive: {
    color: NAVY,
    fontWeight: "800",
  },
  checkMark: {
    fontSize: 16,
    color: NAVY,
    fontWeight: "900",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 16,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 3,
    opacity: 0.4,
  },
  navLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "600",
  },
});