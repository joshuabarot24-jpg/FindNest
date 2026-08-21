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
import api from "../lib/api";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];

export default function ReportFoundScreen({ navigation }: any) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPhotoPreview(uri);
    setPhotoError(false);
    setPhotoUrl(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("folder", "found-items");

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.url);
    } catch (err) {
      console.error("Photo upload failed:", err);
      setPhotoPreview(null);
      setPhotoError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!itemName.trim()) return;
    if (!photoUrl) {
      setPhotoError(true);
      return;
    }

    setSubmitError("");
    setSubmitLoading(true);
    try {
      await api.post("/found-items", {
        item_name: itemName.trim(),
        category: category,
        description: description.trim(),
        location_found: location.trim(),
        date_found: new Date().toISOString().split("T")[0],
        photo_url: photoUrl,
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
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
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {submitted ? (
          <View style={styles.successCard}>
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
              disabled={uploading}
            >
              {uploading ? (
                <Text style={styles.uploadText}>Uploading to cloud...</Text>
              ) : photoPreview ? (
                <>
                  <Image source={{ uri: photoPreview }} style={styles.previewImage} />
                  {photoUrl && <Text style={styles.uploadedText}>Photo uploaded successfully</Text>}
                </>
              ) : (
                <>
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

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, (!itemName.trim() || !photoUrl || submitLoading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!itemName.trim() || !photoUrl || submitLoading}
            >
              <Text style={styles.submitButtonText}>{submitLoading ? "Submitting..." : "Submit Report"}</Text>
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
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const NAVY = "#1a237e";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fc" },
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
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontSize: 16, fontWeight: "900", color: NAVY },
  brandAccent: { color: "#c99700" },
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f3f4f6" },
  scrollContent: { padding: 20, paddingBottom: 30 },
  pageTitle: { fontSize: 20, fontWeight: "900", color: NAVY, marginBottom: 4 },
  pageSubtitle: { fontSize: 12.5, color: "#9ca3af", marginBottom: 22 },
  label: { fontSize: 12.5, fontWeight: "800", color: "#374151", marginBottom: 8 },
  requiredMark: { color: "#ef4444" },
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
  uploadBoxError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  uploadText: { fontSize: 13.5, fontWeight: "700", color: "#374151" },
  uploadTextError: { color: "#ef4444" },
  uploadedText: { fontSize: 11, fontWeight: "700", color: "#22c55e", marginTop: 8 },
  uploadSubtext: { fontSize: 11, color: "#9ca3af", marginTop: 3 },
  uploadSubtextError: { color: "#f87171" },
  errorText: { fontSize: 11.5, fontWeight: "800", color: "#ef4444", marginBottom: 14 },
  previewImage: { width: "100%", height: 150, borderRadius: 12, resizeMode: "cover" },
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
  selectText: { fontSize: 13.5, color: "#374151", fontWeight: "600" },
  selectArrow: { fontSize: 18, color: "#9ca3af" },
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
    backgroundColor: "#f5f3ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  privacyText: { fontSize: 11, color: "#6d28d9", lineHeight: 16 },
  submitButton: { backgroundColor: "#22c55e", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  submitButtonDisabled: { backgroundColor: "#bbf7d0" },
  submitButtonText: { color: "white", fontWeight: "900", fontSize: 15 },
  successCard: { backgroundColor: "white", borderRadius: 20, padding: 28, alignItems: "center", marginTop: 40 },
  successTitle: { fontSize: 18, fontWeight: "900", color: NAVY, marginBottom: 6 },
  successMessage: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 18 },
  reminderBox: {
    backgroundColor: "#fff7ed",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  reminderText: { fontSize: 11.5, color: "#c2410c", lineHeight: 16 },
  successButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: { color: "white", fontWeight: "800", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(13,19,63,0.6)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "70%",
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: NAVY, textAlign: "center", marginBottom: 16 },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryOptionText: { fontSize: 14, color: "#374151", fontWeight: "600" },
  categoryOptionTextActive: { color: NAVY, fontWeight: "800" },
  checkMark: { fontSize: 16, color: NAVY, fontWeight: "900" },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 16,
  },
  navItem: { flex: 1, alignItems: "center" },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
});