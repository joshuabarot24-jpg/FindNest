import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];
const MAX_PHOTOS = 4;
const NAVY = "#1a237e";

function getManilaDateObj(daysAgo: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const m = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const d = parseInt(parts.find((p) => p.type === "day")!.value, 10);

  const result = new Date(y, m - 1, d);
  result.setDate(result.getDate() - daysAgo);
  return result;
}

function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MIN_DATE = getManilaDateObj(2);
const MAX_DATE = getManilaDateObj(0);

interface PhotoItem {
  preview: string;
  url: string | null;
  uploading: boolean;
}

export default function ReportFoundScreen({ navigation }: any) {
  const [itemName, setItemName] = useState("");
  const [itemNameAiFilled, setItemNameAiFilled] = useState(false);
  const [category, setCategory] = useState("Electronics");
  const [othersSpecify, setOthersSpecify] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [description, setDescription] = useState("");
  const [aiFilled, setAiFilled] = useState(false);
  const [location, setLocation] = useState("");
  const [dateObj, setDateObj] = useState<Date>(MAX_DATE);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [itemChoices, setItemChoices] = useState<string[]>([]);
  const [choosingItemUrl, setChoosingItemUrl] = useState<string | null>(null);
  const [resolvingChoice, setResolvingChoice] = useState(false);

  const date = toDateString(dateObj);

  const anyUploading = photos.some((p) => p.uploading);
  const uploadedUrls = photos.filter((p) => p.url).map((p) => p.url as string);

  const handleDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) {
      const clamped = selected < MIN_DATE ? MIN_DATE : selected > MAX_DATE ? MAX_DATE : selected;
      setDateObj(clamped);
    }
  };

  const applyAiFields = (data: any) => {
    if (data.ai_item_name) {
      setItemName(data.ai_item_name);
      setItemNameAiFilled(true);
    }
    if (data.ai_category && categories.includes(data.ai_category)) {
      setCategory(data.ai_category);
    }
    if (data.ai_description) {
      setDescription(data.ai_description);
      setAiFilled(true);
    }
    if (data.ai_details?.primary_color) {
      setPrimaryColor(data.ai_details.primary_color);
    }
    if (data.ai_details?.brand_or_markings) {
      setBrandModel(data.ai_details.brand_or_markings);
    }
  };

  const uploadOne = async (uri: string) => {
    if (photos.length >= MAX_PHOTOS) return;

    setPhotoError(false);
    setPhotoErrorMessage("");
    const isFirstPhoto = photos.length === 0;
    const idx = photos.length;

    setPhotos((prev) => [...prev, { preview: uri, url: null, uploading: true }]);

    try {
      const formData = new FormData();
      formData.append("image", { uri, name: "photo.jpg", type: "image/jpeg" } as any);
      formData.append("folder", "found-items");

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPhotos((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], url: res.data.url, uploading: false };
        return next;
      });

      if (isFirstPhoto) {
        applyAiFields(res.data);
      }
    } catch (err: any) {
      if (err.response?.data?.multiple_items && isFirstPhoto) {
        setPhotos((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], url: err.response.data.url, uploading: false };
          return next;
        });
        setItemChoices(err.response.data.items_found || []);
        setChoosingItemUrl(err.response.data.url);
        return;
      }
      console.error("Photo upload failed:", JSON.stringify(err.response?.data));
      setPhotos((prev) => prev.filter((_, i2) => i2 !== idx));
      setPhotoErrorMessage(err.response?.data?.message || "Photo upload failed. Please try again.");
      setPhotoError(true);
    }
  };

  const handleChooseItem = async (choice: string) => {
    if (!choosingItemUrl) return;
    setResolvingChoice(true);
    try {
      const res = await api.post("/upload/analyze-existing", {
        url: choosingItemUrl,
        item_hint: choice,
      });
      applyAiFields(res.data);
    } catch (err: any) {
      console.error("Failed to analyze chosen item:", err);
      setPhotoErrorMessage("Could not analyze the selected item. You can still fill the fields manually.");
    } finally {
      setChoosingItemUrl(null);
      setItemChoices([]);
      setResolvingChoice(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const pickFromGallery = async () => {
    setShowPhotoOptions(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) uploadOne(result.assets[0].uri);
  };

  const takePhoto = async () => {
    setShowPhotoOptions(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPhotoError(true);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) uploadOne(result.assets[0].uri);
  };

  const handleReview = () => {
    if (!itemName.trim()) return;
    if (uploadedUrls.length === 0) {
      setPhotoError(true);
      return;
    }
    if (!description.trim()) {
      setSubmitError("Description is required. Since AI couldn't auto-fill it, please describe the item manually.");
      return;
    }
    if (!location.trim()) {
      setSubmitError("Location found is required.");
      return;
    }
    setSubmitError("");
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitLoading(true);
    try {
      await api.post("/found-items", {
        item_name: itemName.trim(),
        category: category === "Others" ? othersSpecify.trim() : category,
        description: description,
        location_found: location.trim(),
        date_found: date,
        approx_time: time,
        primary_color: primaryColor,
        brand_model: brandModel,
        photo_url: uploadedUrls[0] || null,
        photo_urls: uploadedUrls,
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
            <Text style={styles.successTitle}>Thank You!</Text>
            <Text style={styles.successMessage}>
              Your found item report has been submitted. Please surrender the item to the school office.
            </Text>
            <View style={styles.reminderBox}>
              <Text style={styles.reminderTitle}>Important Reminder!</Text>
              <Text style={styles.reminderText}>
                Surrender this item to Ms. Shelly S. Durban at the Guidance Office within 2 school days, or the post will be automatically rejected.
              </Text>
            </View>
            <TouchableOpacity style={styles.successButton} onPress={() => navigation.navigate("Home")}>
              <Text style={styles.successButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.pageTitle}>Report Found Item</Text>
            <Text style={styles.pageSubtitle}>Help reunite this item with its owner</Text>

            <Text style={styles.label}>
              Upload Photos <Text style={styles.requiredMark}>*</Text>
              <Text style={styles.hintText}> (up to {MAX_PHOTOS}, different angles help)</Text>
            </Text>

            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map((p, idx) => (
                  <View key={idx} style={styles.photoThumbWrap}>
                    <Image source={{ uri: p.preview }} style={styles.photoThumb} />
                    {p.uploading && (
                      <View style={styles.photoThumbLoading}>
                        <Text style={styles.photoThumbLoadingText}>...</Text>
                      </View>
                    )}
                    {!p.uploading && (
                      <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removePhoto(idx)}>
                        <Text style={styles.photoRemoveBtnText}>×</Text>
                      </TouchableOpacity>
                    )}
                    {idx === 0 && <Text style={styles.mainBadge}>MAIN</Text>}
                  </View>
                ))}
              </View>
            )}

            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                style={[styles.uploadBox, photoError && styles.uploadBoxError]}
                onPress={() => setShowPhotoOptions(true)}
              >
                <Ionicons name="camera-outline" size={26} color={photoError ? "#ef4444" : "#9ca3af"} style={{ marginBottom: 6 }} />
                <Text style={[styles.uploadText, photoError && styles.uploadTextError]}>
                  {photos.length === 0 ? "Add a Photo" : `Add more (${MAX_PHOTOS - photos.length} left)`}
                </Text>
              </TouchableOpacity>
            )}
            {photoError && (
              <Text style={styles.errorText}>{photoErrorMessage || "At least one photo is required before you can submit this report."}</Text>
            )}

            <View style={styles.labelRow}>
              <Text style={styles.label}>Item Name</Text>
              {itemNameAiFilled && <Text style={styles.autoTag}>auto-detected, editable</Text>}
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. Scientific Calculator"
              placeholderTextColor="#9ca3af"
              value={itemName}
              onChangeText={setItemName}
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>Category</Text>
              {uploadedUrls.length > 0 && <Text style={styles.autoTag}>auto-detected, editable</Text>}
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
                Primary Color(s) {!primaryColor && <Text style={styles.requiredMark}>*</Text>}
              </Text>
              {!!primaryColor && <Text style={styles.autoTag}>auto-detected, editable</Text>}
            </View>
            <TextInput
              style={styles.input}
              placeholder="If AI couldn't detect this, fill in manually (e.g. Black, Silver)"
              placeholderTextColor="#9ca3af"
              value={primaryColor}
              onChangeText={setPrimaryColor}
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Brand & Model {!brandModel && <Text style={styles.requiredMark}>*</Text>}
              </Text>
              {!!brandModel && <Text style={styles.autoTag}>auto-detected, editable</Text>}
            </View>
            <TextInput
              style={styles.input}
              placeholder="If AI couldn't detect this, fill in manually (e.g. Apple iPhone 15)"
              placeholderTextColor="#9ca3af"
              value={brandModel}
              onChangeText={setBrandModel}
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Description {!aiFilled && <Text style={styles.requiredMark}>*</Text>}
              </Text>
              {aiFilled && <Text style={styles.autoTag}>auto-filled by AI, editable</Text>}
            </View>
            <TextInput
              style={[styles.textArea, !aiFilled && !description.trim() && styles.uploadBoxError]}
              placeholder={aiFilled ? "" : "If our AI could not auto-fill this. Please describe the item manually — any details that might help identify the owner."}
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Location Found</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Library, Canteen, Room 402"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Date Found</Text>
            <TouchableOpacity style={styles.dateInputBox} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateInputText}>{date}</Text>
              <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <Text style={styles.lockedDateHint}>Only today or up to 2 days ago can be selected</Text>

            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={MIN_DATE}
                maximumDate={MAX_DATE}
                onChange={handleDateChange}
              />
            )}
            {Platform.OS === "ios" && showDatePicker && (
              <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.iosDoneButtonText}>Done</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>Approx. Time Found</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2:30 PM"
              placeholderTextColor="#9ca3af"
              value={time}
              onChangeText={setTime}
            />

            <View style={styles.surrenderNote}>
              <Text style={styles.surrenderNoteTitle}>Surrender Reminder!</Text>
              <Text style={styles.surrenderNoteText}>
                You must surrender this item to Ms. Shelly S. Durban at the Guidance Office within 2 school days. Failure to do so will result in automatic post rejection.
              </Text>
            </View>

            <View style={styles.privacyNote}>
              <Text style={styles.privacyNoteText}>This report is private and visible only to you and administrators</Text>
            </View>

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, (!itemName.trim() || uploadedUrls.length === 0 || anyUploading) && styles.submitButtonDisabled]}
              onPress={handleReview}
              disabled={!itemName.trim() || uploadedUrls.length === 0 || anyUploading}
            >
              <Text style={styles.submitButtonText}>{anyUploading ? "Waiting for photo analysis..." : "Review Report"}</Text>
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

      <Modal visible={!!choosingItemUrl} animationType="slide" transparent onRequestClose={() => { setChoosingItemUrl(null); setItemChoices([]); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Multiple Items Detected</Text>
            <Text style={styles.confirmSubtitle}>We found several items in your photo. Which one did you find?</Text>
            {resolvingChoice ? (
              <Text style={styles.uploadText}>Analyzing your selection...</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {itemChoices.map((choice, idx) => (
                  <TouchableOpacity key={idx} style={styles.categoryOption} onPress={() => handleChooseItem(choice)}>
                    <Text style={styles.categoryOptionText}>{choice}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => { setChoosingItemUrl(null); setItemChoices([]); }} style={{ paddingVertical: 14, alignItems: "center" }}>
                  <Text style={{ color: "#9ca3af", fontWeight: "700", fontSize: 13 }}>None of these — I'll fill in manually</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirm} animationType="slide" transparent onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Confirm Your Report</Text>
            <Text style={styles.confirmSubtitle}>Please review before submitting — this report stays private, visible only to you and admin</Text>

            <View style={styles.confirmBox}>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Item: </Text>{itemName}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Category: </Text>{category === "Others" ? othersSpecify : category}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Primary Color(s): </Text>{primaryColor || "Not specified"}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Brand & Model: </Text>{brandModel || "Not specified"}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Description: </Text>{description}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Location: </Text>{location}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Date: </Text>{date} {time ? `at ${time}` : ""}</Text>
              <Text style={styles.confirmRow}><Text style={styles.confirmLabel}>Photos: </Text>{uploadedUrls.length} attached</Text>
            </View>

            <View style={styles.confirmButtonRow}>
              <TouchableOpacity style={styles.confirmCancelButton} onPress={() => setShowConfirm(false)}>
                <Text style={styles.confirmCancelText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmSubmitButtonGreen}
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
  hintText: { fontSize: 10.5, fontWeight: "600", color: "#9ca3af" },
  autoTag: { fontSize: 10.5, fontWeight: "700", color: "#22c55e" },
  requiredMark: { color: "#ef4444" },
  input: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 13.5, color: "#374151", marginBottom: 16 },
  dateInputBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13 },
  dateInputText: { fontSize: 13.5, color: "#374151", fontWeight: "700" },
  lockedDateHint: { fontSize: 10.5, color: "#9ca3af", marginTop: 6, marginBottom: 16 },
  iosDoneButton: { backgroundColor: NAVY, borderRadius: 12, paddingVertical: 10, alignItems: "center", marginBottom: 16 },
  iosDoneButtonText: { color: "white", fontWeight: "800", fontSize: 13 },
  textArea: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, padding: 16, fontSize: 13.5, color: "#374151", minHeight: 100, marginBottom: 16 },
  selectBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  selectText: { fontSize: 13.5, color: "#374151", fontWeight: "600" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  photoThumbWrap: { width: "23%", aspectRatio: 1, position: "relative" },
  photoThumb: { width: "100%", height: "100%", borderRadius: 12, resizeMode: "cover" },
  photoThumbLoading: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  photoThumbLoadingText: { color: "white", fontWeight: "800" },
  photoRemoveBtn: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center" },
  photoRemoveBtnText: { color: "white", fontWeight: "900", fontSize: 13, lineHeight: 16 },
  mainBadge: { position: "absolute", bottom: 2, left: 2, backgroundColor: "#22c55e", color: "white", fontSize: 8, fontWeight: "800", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, overflow: "hidden" },
  uploadBox: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderStyle: "dashed", borderRadius: 16, paddingVertical: 24, alignItems: "center", marginBottom: 8 },
  uploadBoxError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  uploadText: { fontSize: 13.5, fontWeight: "700", color: "#374151" },
  uploadTextError: { color: "#ef4444" },
  errorText: { fontSize: 11.5, fontWeight: "800", color: "#ef4444", marginBottom: 14 },
  surrenderNote: { backgroundColor: "#fff7ed", borderRadius: 14, padding: 14, marginBottom: 12 },
  surrenderNoteTitle: { fontSize: 12.5, fontWeight: "800", color: "#c2410c", marginBottom: 4 },
  surrenderNoteText: { fontSize: 11, color: "#c2410c", lineHeight: 16 },
  privacyNote: { backgroundColor: "#f5f3ff", borderRadius: 12, padding: 12, marginBottom: 20 },
  privacyNoteText: { fontSize: 11, color: "#6d28d9", lineHeight: 16 },
  submitButton: { backgroundColor: "#22c55e", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  submitButtonDisabled: { backgroundColor: "#bbf7d0" },
  submitButtonText: { color: "white", fontWeight: "900", fontSize: 15 },
  successCard: { backgroundColor: "white", borderRadius: 20, padding: 28, alignItems: "center", marginTop: 40 },
  successTitle: { fontSize: 18, fontWeight: "900", color: NAVY, marginBottom: 6 },
  successMessage: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 18 },
  reminderBox: { backgroundColor: "#fff7ed", borderRadius: 14, padding: 14, marginBottom: 20, width: "100%" },
  reminderTitle: { fontSize: 12.5, fontWeight: "800", color: "#c2410c", marginBottom: 4 },
  reminderText: { fontSize: 11.5, color: "#c2410c", lineHeight: 16 },
  successButton: { backgroundColor: NAVY, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
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
  confirmSubmitButtonGreen: { flex: 1, backgroundColor: "#22c55e", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmSubmitText: { color: "white", fontWeight: "800", fontSize: 13 },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
});