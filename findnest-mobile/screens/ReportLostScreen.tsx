import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];

const NAVY = "#1a237e";

export default function ReportLostScreen({ navigation }: any) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [othersSpecify, setOthersSpecify] = useState("");
  const [description, setDescription] = useState("");
  const [aiFilled, setAiFilled] = useState(false);
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const uploadPhoto = async (uri: string) => {
    setPhotoPreview(uri);
    setPhotoError(false);
    setPhotoErrorMessage("");
    setPhotoUrl(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", { uri, name: "photo.jpg", type: "image/jpeg" } as any);
      formData.append("folder", "lost-items");

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.url);

      if (res.data.ai_category && categories.includes(res.data.ai_category)) {
        setCategory(res.data.ai_category);
      }
      if (res.data.ai_description) {
        setDescription(res.data.ai_description);
        setAiFilled(true);
      } else {
        setAiFilled(false);
      }
    } catch (err: any) {
      console.error("Photo upload failed:", err);
      setPhotoPreview(null);
      setPhotoError(true);
      setPhotoErrorMessage(err.response?.data?.message || "Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const pickFromGallery = async () => {
    setShowPhotoOptions(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) uploadPhoto(result.assets[0].uri);
  };

  const takePhoto = async () => {
    setShowPhotoOptions(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPhotoError(true);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled) uploadPhoto(result.assets[0].uri);
  };

  const handleReview = () => {
    if (!itemName.trim()) return;
    if (!photoUrl) {
      setPhotoError(true);
      return;
    }
    if (!description.trim()) {
      setSubmitError("Description is required. Since AI couldn't auto-fill it, please describe your item manually.");
      return;
    }
    setSubmitError("");
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitLoading(true);
    try {
      await api.post("/lost-items", {
        item_name: itemName.trim(),
        category: category === "Others" ? othersSpecify.trim() : category,
        description: description,
        location_lost: location.trim(),
        date_lost: new Date().toISOString().split("T")[0],
        photo_url: photoUrl,
      });
      setShowConfirm(false);
      setSubmitted(true);
    } catch (err: any) {
      setShowConfirm(false);
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
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
          <Ionicons name="help-circle-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={30}
      >
        {submitted ? (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={40} color="#22c55e" style={{ marginBottom: 10 }} />
            <Text style={styles.successTitle}>Report Submitted!</Text>
            <Text style={styles.successMessage}>
              Our AI is now comparing your report against found items.
            </Text>
            <TouchableOpacity style={styles.successButton} onPress={() => navigation.navigate("Home")}>
              <Text style={styles.successButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.pageTitle}>Report Lost Item</Text>
            <Text style={styles.pageSubtitle}>Help us help you find it faster</Text>

            <Text style={styles.label}>
              Upload Photo <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.uploadBox, photoError && styles.uploadBoxError]}
              onPress={() => setShowPhotoOptions(true)}
              disabled={uploading}
            >
              {uploading ? (
                <Text style={styles.uploadText}>Analyzing photo with AI...</Text>
              ) : photoPreview ? (
                <>
                  <Image source={{ uri: photoPreview }} style={styles.previewImage} />
                  {photoUrl && <Text style={styles.uploadedText}>Photo uploaded and analyzed</Text>}
                </>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={30} color={photoError ? "#ef4444" : "#9ca3af"} style={{ marginBottom: 8 }} />
                  <Text style={[styles.uploadText, photoError && styles.uploadTextError]}>Add a Photo</Text>
                  <Text style={[styles.uploadSubtext, photoError && styles.uploadSubtextError]}>Choose from gallery or take a picture</Text>
                </>
              )}
            </TouchableOpacity>
            {photoError && (
              <Text style={styles.errorText}>{photoErrorMessage || "A photo is required before you can submit your report."}</Text>
            )}

            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Red iPhone with clear case"
              placeholderTextColor="#9ca3af"
              value={itemName}
              onChangeText={setItemName}
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>Category</Text>
              {photoUrl && <Text style={styles.autoTag}>auto-detected, editable</Text>}
            </View>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowCategoryPicker(true)}>
              <Text style={styles.selectText}>{category}</Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>

            {category === "Others" && (
              <>
                <Text style={styles.label}>Please Specify</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tell us what kind of item this is"
                  placeholderTextColor="#9ca3af"
                  value={othersSpecify}
                  onChangeText={setOthersSpecify}
                />
              </>
            )}

            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Description {!aiFilled && <Text style={styles.requiredMark}>*</Text>}
              </Text>
              {aiFilled && <Text style={styles.autoTag}>auto-filled by AI, editable</Text>}
            </View>
            <TextInput
              style={[styles.textArea, !aiFilled && !description.trim() && styles.uploadBoxError]}
              placeholder={aiFilled ? "" : "Our AI could not auto-fill this. Please describe your item manually (color, brand, markings)."}
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Last Seen Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Science Lab, Canteen"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Approx. Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2:30 PM"
              placeholderTextColor="#9ca3af"
              value={time}
              onChangeText={setTime}
            />

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, (!itemName.trim() || !photoUrl || uploading) && styles.submitButtonDisabled]}
              onPress={handleReview}
              disabled={!itemName.trim() || !photoUrl || uploading}
            >
              <Text style={styles.submitButtonText}>{uploading ? "Waiting for photo analysis..." : "Review Report"}</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAwareScrollView>

      <Modal visible={showPhotoOptions} animationType="slide" transparent onRequestClose={() => setShowPhotoOptions(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPhotoOptions(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add a Photo</Text>

            <TouchableOpacity style={styles.photoOption} onPress={takePhoto}>
              <View style={styles.photoOptionIcon}>
                <Ionicons name="camera-outline" size={22} color={NAVY} />
              </View>
              <View>
                <Text style={styles.photoOptionText}>Take Picture</Text>
                <Text style={styles.photoOptionSub}>Use your camera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoOption} onPress={pickFromGallery}>
              <View style={styles.photoOptionIcon}>
                <Ionicons name="images-outline" size={22} color={NAVY} />
              </View>
              <View>
                <Text style={styles.photoOptionText}>Choose from Gallery</Text>
                <Text style={styles.photoOptionSub}>Select an existing photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showCategoryPicker} animationType="slide" transparent onRequestClose={() => setShowCategoryPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((item) => (
              <TouchableOpacity key={item} style={styles.categoryOption} onPress={() => { setCategory(item); setShowCategoryPicker(false); }}>
                <Text style={[styles.categoryOptionText, category === item && styles.categoryOptionTextActive]}>{item}</Text>
                {category === item && <Ionicons name="checkmark" size={18} color={NAVY} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showConfirm} animationType="slide" transparent onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Confirm Your Report</Text>
            <Text style={styles.confirmSubtitle}>Please review before submitting — this will be visible to other students</Text>

            <View style={styles.confirmBox}>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Item: </Text>{itemName}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Category: </Text>{category === "Others" ? othersSpecify : category}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Description: </Text>{description}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Location: </Text>{location} {time ? `at ${time}` : ""}</Text>
            </View>

            <View style={styles.confirmButtonRow}>
              <TouchableOpacity style={styles.confirmCancelButton} onPress={() => setShowConfirm(false)}>
                <Text style={styles.confirmCancelText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmSubmitButton}
                onPress={handleFinalSubmit}
                disabled={submitLoading}
              >
                <Text style={styles.confirmSubmitText}>{submitLoading ? "Submitting..." : "Confirm & Submit"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Ionicons name="search-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Ionicons name="document-text-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fc" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontSize: 16, fontWeight: "900", color: NAVY },
  brandAccent: { color: "#c99700" },
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 30 },
  pageTitle: { fontSize: 20, fontWeight: "900", color: NAVY, marginBottom: 4 },
  pageSubtitle: { fontSize: 12.5, color: "#9ca3af", marginBottom: 22 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 12.5, fontWeight: "800", color: "#374151" },
  autoTag: { fontSize: 10.5, fontWeight: "700", color: "#22c55e" },
  requiredMark: { color: "#ef4444" },
  input: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 13.5, color: "#374151", marginBottom: 16 },
  textArea: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, padding: 16, fontSize: 13.5, color: "#374151", minHeight: 100, marginBottom: 16 },
  selectBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  selectText: { fontSize: 13.5, color: "#374151", fontWeight: "600" },
  uploadBox: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderStyle: "dashed", borderRadius: 16, paddingVertical: 30, alignItems: "center", marginBottom: 8 },
  uploadBoxError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  uploadText: { fontSize: 13.5, fontWeight: "700", color: "#374151" },
  uploadTextError: { color: "#ef4444" },
  uploadedText: { fontSize: 11, fontWeight: "700", color: "#22c55e", marginTop: 8 },
  uploadSubtext: { fontSize: 11, color: "#9ca3af", marginTop: 3 },
  uploadSubtextError: { color: "#f87171" },
  errorText: { fontSize: 11.5, fontWeight: "800", color: "#ef4444", marginBottom: 14 },
  previewImage: { width: "100%", height: 160, borderRadius: 12, resizeMode: "cover" },
  submitButton: { backgroundColor: "#ef4444", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  submitButtonDisabled: { backgroundColor: "#fca5a5" },
  submitButtonText: { color: "white", fontWeight: "900", fontSize: 15 },
  successCard: { backgroundColor: "white", borderRadius: 20, padding: 32, alignItems: "center", marginTop: 60 },
  successTitle: { fontSize: 18, fontWeight: "900", color: NAVY, marginBottom: 6 },
  successMessage: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 20 },
  successButton: { backgroundColor: NAVY, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24 },
  successButtonText: { color: "white", fontWeight: "800", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(13,19,63,0.6)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: "70%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: NAVY, textAlign: "center", marginBottom: 16 },
  photoOption: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 14 },
  photoOptionIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#eef2ff", justifyContent: "center", alignItems: "center" },
  photoOptionText: { fontSize: 14, fontWeight: "700", color: "#374151" },
  photoOptionSub: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  categoryOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  categoryOptionText: { fontSize: 14, color: "#374151", fontWeight: "600" },
  categoryOptionTextActive: { color: NAVY, fontWeight: "800" },
  confirmCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  confirmSubtitle: { fontSize: 12, color: "#9ca3af", textAlign: "center", marginBottom: 16 },
  confirmBox: { backgroundColor: "#f8f9fc", borderRadius: 16, padding: 16, marginBottom: 20, gap: 8 },
  confirmRow: { fontSize: 13, color: "#6b7280" },
  confirmLabel: { fontWeight: "800", color: "#374151" },
  confirmButtonRow: { flexDirection: "row", gap: 12 },
  confirmCancelButton: { flex: 1, borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmCancelText: { color: "#9ca3af", fontWeight: "800", fontSize: 13 },
  confirmSubmitButton: { flex: 1, backgroundColor: "#ef4444", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmSubmitText: { color: "white", fontWeight: "800", fontSize: 13 },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
});