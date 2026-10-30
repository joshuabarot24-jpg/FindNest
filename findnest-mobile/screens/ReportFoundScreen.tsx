import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForcePasswordChange } from "../lib/useForcePasswordChange";
import api from "../lib/api";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];
const MAX_PHOTOS = 1;
const GREEN = "#0E4D34";
const WASH = "#317A57";
const RED = "#EF4444";
const FIELD_BG = "#F1F5F9";
const SAGE = "#C8D7CE";

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

const MAX_DATE = getManilaDateObj(0);

interface PhotoItem {
  preview: string;
  url: string | null;
  uploading: boolean;
}

export default function ReportFoundScreen({ navigation }: any) {
  useForcePasswordChange(navigation);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"form" | "review">("form");

  // Admin can grant a student a manual AI override: no photo analysis, no auto-fill
  const [overrideOn, setOverrideOn] = useState(false);
  useEffect(() => {
    api.get("/profile")
      .then((r) => setOverrideOn(!!r.data.user?.manual_override_granted))
      .catch(() => {});
  }, []);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [othersSpecify, setOthersSpecify] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateObj, setDateObj] = useState<Date>(MAX_DATE);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tHour, setTHour] = useState(12);
  const [tMin, setTMin] = useState(0);
  const [tPeriod, setTPeriod] = useState<"AM" | "PM">("PM");

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

  // What the AI detected, shown next to the student's own entries in the review step
  const [aiData, setAiData] = useState({ name: "", category: "", color: "", brand: "" });

  const date = toDateString(dateObj);
  const anyUploading = photos.some((p) => p.uploading);
  const uploadedUrls = photos.filter((p) => p.url).map((p) => p.url as string);
  const finalCategory = category === "Others" ? othersSpecify : category;

  const confirmTime = () => {
    setTime(`${tHour}:${String(tMin).padStart(2, "0")} ${tPeriod}`);
    setShowTimePicker(false);
  };

  const applyAiFields = (data: any) => {
    setAiData({
      name: data.ai_item_name || "",
      category: data.ai_category || "",
      color: data.ai_details?.primary_color || "",
      brand: data.ai_details?.brand_or_markings || "",
    });
    if (data.ai_item_name) setItemName(data.ai_item_name);
    if (data.ai_category && categories.includes(data.ai_category)) {
      setCategory(data.ai_category);
      if (data.ai_category === "Others" && data.ai_item_name) setOthersSpecify(data.ai_item_name);
    }
    if (data.ai_description) setDescription(data.ai_description);
    if (data.ai_details?.primary_color) setPrimaryColor(data.ai_details.primary_color);
    if (data.ai_details?.brand_or_markings) setBrandModel(data.ai_details.brand_or_markings);
  };

  const uploadOne = async (uri: string) => {
    if (photos.length >= MAX_PHOTOS) return;

    setPhotoError(false);
    setPhotoErrorMessage("");
    const isFirstPhoto = photos.length === 0;
    const idx = photos.length;

    Keyboard.dismiss();
    setPhotos((prev) => [...prev, { preview: uri, url: null, uploading: true }]);

    try {
      const formData = new FormData();
      formData.append("image", { uri, name: "photo.jpg", type: "image/jpeg" } as any);
      formData.append("folder", "found-items");
      if (overrideOn) formData.append("analyze", "false");

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPhotos((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], url: res.data.url, uploading: false };
        return next;
      });

      if (isFirstPhoto && !overrideOn) applyAiFields(res.data);
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
      const res = await api.post("/upload/analyze-existing", { url: choosingItemUrl, item_hint: choice });
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

  const removePhoto = (index: number) => setPhotos((prev) => prev.filter((_, i) => i !== index));

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

  // Form -> review step
  const handleReview = () => {
    if (!itemName.trim()) {
      setSubmitError("Item name is required.");
      return;
    }
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
    setStep("review");
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
      setStep("form");
      setSubmitError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || "—"}</Text>
    </View>
  );

  const canReview = !!itemName.trim() && uploadedUrls.length > 0 && !anyUploading;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.card}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={30}
        >
          {step === "form" ? (
            <>
              <View style={styles.headRow}>
                <Text style={styles.title}>I Found Something</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Home")} hitSlop={10}>
                  <Ionicons name="close" size={28} color="#111827" />
                </TouchableOpacity>
              </View>

              {/* Upload block */}
              {photos.length > 0 ? (
                <View style={styles.photoBlock}>
                  <Image source={{ uri: photos[0].preview }} style={styles.photoPreview} resizeMode="contain" />
                  {!photos[0].uploading ? (
                    <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(0)}>
                      <Text style={styles.photoRemoveText}>×</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadBlock, photoError && styles.uploadBlockError]}
                  onPress={() => setShowPhotoOptions(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="image-outline" size={44} color="#5E7A6B" />
                  <Text style={styles.uploadTitle}>Click/tap to upload photo</Text>
                  <Text style={styles.uploadHelp}>
                    FindNest uses advanced AI image recognition to match lost and found items on campus. Submit a report, get notified instantly.
                  </Text>
                </TouchableOpacity>
              )}
              {photoError ? (
                <Text style={styles.errorText}>{photoErrorMessage || "At least one photo is required before you can submit this report."}</Text>
              ) : null}

              {/* Fields */}
              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={styles.label}>Item Name</Text>
                  <TextInput style={styles.input} value={itemName} onChangeText={setItemName} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Category</Text>
                  <TouchableOpacity style={[styles.input, styles.selectRow]} onPress={() => setShowCategoryPicker(true)}>
                    <Text style={styles.selectText} numberOfLines={1}>{category}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {category === "Others" ? (
                <View style={styles.fullField}>
                  <Text style={styles.label}>Please Specify</Text>
                  <TextInput style={styles.input} value={othersSpecify} onChangeText={setOthersSpecify} />
                </View>
              ) : null}

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={styles.label}>Primary Colors</Text>
                  <TextInput style={styles.input} value={primaryColor} onChangeText={setPrimaryColor} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Model and Brand</Text>
                  <TextInput style={styles.input} value={brandModel} onChangeText={setBrandModel} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={styles.label}>Date Found</Text>
                  <TouchableOpacity style={[styles.input, styles.selectRow]} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.selectText} numberOfLines={1}>
                      {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Approx. Time Found</Text>
                  <TouchableOpacity style={[styles.input, styles.selectRow]} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.selectText}>{time}</Text>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fullField}>
                <Text style={styles.label}>Location Found</Text>
                <TextInput style={styles.input} value={location} onChangeText={setLocation} />
              </View>

              <View style={styles.fullField}>
                <Text style={styles.label}>Item Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.note}>
                <Text style={styles.noteTitle}>Surrender Reminder!</Text>
                <Text style={styles.noteText}>
                  Surrender this item to Ms. Shelly S. Durban at the Guidance Office within 2 school days, or the post will be automatically rejected.
                </Text>
              </View>
              <Text style={styles.privacy}>This report is private and visible only to you and administrators.</Text>

              {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
            </>
          ) : (
            <>
              <View style={styles.headRow}>
                <View>
                  <Text style={styles.crumb}>Report review</Text>
                  <Text style={styles.title}>Review Your Report</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Home")} hitSlop={10}>
                  <Ionicons name="close" size={28} color="#111827" />
                </TouchableOpacity>
              </View>

              <View style={styles.reviewHero}>
                <View style={styles.reviewThumb}>
                  {photos[0]?.preview ? (
                    <Image source={{ uri: photos[0].preview }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                  ) : (
                    <Text style={{ color: "#6b7280", fontSize: 11 }}>No photo</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{itemName}</Text>
                  <Text style={styles.reviewColor}>{primaryColor || "Color not specified"}</Text>
                  <Text style={styles.reviewBrand}>{brandModel || "Brand not specified"}</Text>
                </View>
              </View>

              <View style={styles.compare}>
                <View style={styles.compareCol}>
                  <Text style={styles.compareHead}>You submitted</Text>
                  <ReviewRow label="Item Name:" value={itemName} />
                  <ReviewRow label="Category:" value={finalCategory} />
                  <ReviewRow label="Primary color:" value={primaryColor} />
                  <ReviewRow label="Brand and Models:" value={brandModel} />
                </View>
                <View style={styles.divider} />
                <View style={styles.compareCol}>
                  <Text style={styles.compareHead}>AI analyzed</Text>
                  <ReviewRow label="Item Name:" value={aiData.name} />
                  <ReviewRow label="Category:" value={aiData.category} />
                  <ReviewRow label="Primary color:" value={aiData.color} />
                  <ReviewRow label="Brand and Models:" value={aiData.brand} />
                </View>
              </View>

              <View style={styles.compare}>
                <View style={{ flex: 1 }}>
                  <ReviewRow label="Description:" value={description} />
                  <ReviewRow label="Found at:" value={location} />
                  <ReviewRow label="Date found:" value={`${date}${time ? ` at ${time}` : ""}`} />
                </View>
              </View>

              <TouchableOpacity onPress={() => setStep("form")} style={{ alignSelf: "center", marginTop: 4 }}>
                <Text style={styles.editLink}>← Edit report</Text>
              </TouchableOpacity>
            </>
          )}
        </KeyboardAwareScrollView>

        {/* Green wash rising from the bottom, with the submit button on top */}
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(220,252,231,0)", "#DCFCE7", "#86EFAC"]}
          style={styles.wash}
        />
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 40 }]}>
          <TouchableOpacity
            style={styles.cta}
            onPress={step === "form" ? handleReview : () => setShowConfirm(true)}
            disabled={step === "form" && !canReview}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaText}>
              {step === "form" && anyUploading ? "Waiting for photo analysis..." : "Click to submit report"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lock the form while a photo is analyzed */}
      {anyUploading ? (
        <View style={styles.analyzingOverlay} pointerEvents="auto">
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.analyzingText}>Analyzing your photo...</Text>
            <Text style={styles.analyzingSub}>Please wait. The form is locked until it finishes.</Text>
          </View>
        </View>
      ) : null}

      {/* Photo options */}
      <Modal visible={showPhotoOptions} animationType="slide" transparent onRequestClose={() => setShowPhotoOptions(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPhotoOptions(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add a Photo</Text>
            <TouchableOpacity style={styles.photoOption} onPress={takePhoto}>
              <View style={styles.photoOptionIcon}>
                <Ionicons name="camera-outline" size={22} color={GREEN} />
              </View>
              <View>
                <Text style={styles.photoOptionText}>Take Picture</Text>
                <Text style={styles.photoOptionSub}>Use your camera</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOption} onPress={pickFromGallery}>
              <View style={styles.photoOptionIcon}>
                <Ionicons name="images-outline" size={22} color={GREEN} />
              </View>
              <View>
                <Text style={styles.photoOptionText}>Choose from Gallery</Text>
                <Text style={styles.photoOptionSub}>Select an existing photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date */}
      <Modal visible={showDatePicker} animationType="slide" transparent onRequestClose={() => setShowDatePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Date Found</Text>
            <Text style={styles.modalSub}>Today or up to 2 days ago</Text>
            {[0, 1, 2].map((daysAgo) => {
              const d = getManilaDateObj(daysAgo);
              const value = toDateString(d);
              const on = value === date;
              const label = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : "2 days ago";
              return (
                <TouchableOpacity
                  key={daysAgo}
                  style={styles.categoryOption}
                  onPress={() => { setDateObj(d); setShowDatePicker(false); }}
                >
                  <View>
                    <Text style={[styles.categoryOptionText, on && styles.categoryOptionTextActive]}>{label}</Text>
                    <Text style={styles.photoOptionSub}>
                      {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                  {on ? <Ionicons name="checkmark" size={18} color={GREEN} /> : null}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Time */}
      <Modal visible={showTimePicker} animationType="slide" transparent onRequestClose={() => setShowTimePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Approx. Time Found</Text>
            <View style={styles.timeRow}>
              <ScrollView style={styles.timeCol} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <TouchableOpacity key={h} style={[styles.timeItem, tHour === h && styles.timeItemOn]} onPress={() => setTHour(h)}>
                    <Text style={[styles.timeText, tHour === h && styles.timeTextOn]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.timeColon}>:</Text>
              <ScrollView style={styles.timeCol} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <TouchableOpacity key={m} style={[styles.timeItem, tMin === m && styles.timeItemOn]} onPress={() => setTMin(m)}>
                    <Text style={[styles.timeText, tMin === m && styles.timeTextOn]}>{String(m).padStart(2, "0")}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.timeCol}>
                {(["AM", "PM"] as const).map((p) => (
                  <TouchableOpacity key={p} style={[styles.timeItem, tPeriod === p && styles.timeItemOn]} onPress={() => setTPeriod(p)}>
                    <Text style={[styles.timeText, tPeriod === p && styles.timeTextOn]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.timeDone} onPress={confirmTime} activeOpacity={0.9}>
              <Text style={styles.timeDoneText}>Set time</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Category */}
      <Modal visible={showCategoryPicker} animationType="slide" transparent onRequestClose={() => setShowCategoryPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((item) => (
              <TouchableOpacity key={item} style={styles.categoryOption} onPress={() => { setCategory(item); setShowCategoryPicker(false); }}>
                <Text style={[styles.categoryOptionText, category === item && styles.categoryOptionTextActive]}>{item}</Text>
                {category === item ? <Ionicons name="checkmark" size={18} color={GREEN} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Multiple items */}
      <Modal visible={!!choosingItemUrl} animationType="slide" transparent onRequestClose={() => { setChoosingItemUrl(null); setItemChoices([]); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Multiple Items Detected</Text>
            <Text style={styles.modalSub}>We found several items in your photo. Which one did you find?</Text>
            {resolvingChoice ? (
              <Text style={styles.photoOptionText}>Analyzing your selection...</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {itemChoices.map((choice, idx) => (
                  <TouchableOpacity key={idx} style={styles.categoryOption} onPress={() => handleChooseItem(choice)}>
                    <Text style={styles.categoryOptionText}>{choice}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => { setChoosingItemUrl(null); setItemChoices([]); }} style={{ paddingVertical: 14, alignItems: "center" }}>
                  <Text style={{ color: "#6b7280", fontWeight: "700", fontSize: 13 }}>None of these, I&apos;ll fill in manually</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirmation */}
      <Modal visible={showConfirm} animationType="fade" transparent onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Submit Found-item Report?</Text>
            <Text style={styles.confirmSub}>Send report to the campus lost and found located in{"\n"}Guidance office</Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirm(false)} disabled={submitLoading}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleFinalSubmit} disabled={submitLoading}>
                <Text style={styles.btnText}>{submitLoading ? "Submitting..." : "Confirm Report"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success */}
      <Modal visible={submitted} animationType="fade" transparent onRequestClose={() => {}}>
        <View style={styles.centerOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={24} color="white" />
            </View>
            <Text style={styles.confirmTitle}>Report Submitted Successfully</Text>
            <Text style={styles.confirmSub}>Send report to the campus lost and found located in{"\n"}Guidance office</Text>
            <View style={styles.reminderBox}>
              <Text style={styles.reminderTitle}>Important Reminder!</Text>
              <Text style={styles.reminderText}>
                Surrender this item to Ms. Shelly S. Durban at the Guidance Office within 2 school days, or the post will be automatically rejected and your account may be flagged.
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.btnText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  card: { flex: 1, backgroundColor: "white", overflow: "hidden" },
  scrollContent: { paddingTop: 20, paddingHorizontal: 18, paddingBottom: 180 },

  headRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  crumb: { fontSize: 11, color: "#9ca3af" },
  title: { fontSize: 26, fontWeight: "900", color: "#000" },

  uploadBlock: { backgroundColor: SAGE, borderRadius: 22, paddingVertical: 24, paddingHorizontal: 20, alignItems: "center", marginBottom: 16 },
  uploadBlockError: { borderWidth: 2, borderColor: RED },
  uploadTitle: { fontSize: 15, fontWeight: "900", color: "#111827", marginTop: 8 },
  uploadHelp: { fontSize: 11, color: "#4b5563", textAlign: "center", marginTop: 6, lineHeight: 15 },
  photoBlock: { backgroundColor: SAGE, borderRadius: 22, padding: 10, marginBottom: 16 },
  photoPreview: { width: "100%", height: 200 },
  photoRemove: { position: "absolute", top: -6, right: -6, width: 26, height: 26, borderRadius: 13, backgroundColor: RED, alignItems: "center", justifyContent: "center" },
  photoRemoveText: { color: "white", fontWeight: "900", fontSize: 16, lineHeight: 19 },

  twoCol: { flexDirection: "row", gap: 12, marginBottom: 14 },
  col: { flex: 1 },
  fullField: { marginBottom: 14 },
  label: { fontSize: 12.5, fontWeight: "700", color: "#111827", marginBottom: 6, marginLeft: 6 },
  input: { backgroundColor: FIELD_BG, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, color: "#1f2937" },
  selectRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  selectText: { fontSize: 13, color: "#1f2937", flexShrink: 1 },
  textArea: { minHeight: 110, borderRadius: 24, paddingTop: 14 },
  errorText: { fontSize: 11.5, fontWeight: "800", color: RED, marginBottom: 12 },

  note: { backgroundColor: "#fff7ed", borderRadius: 16, padding: 12, marginBottom: 8 },
  noteTitle: { fontSize: 12, fontWeight: "800", color: "#c2410c", marginBottom: 3 },
  noteText: { fontSize: 11, color: "#c2410c", lineHeight: 15 },
  privacy: { fontSize: 10.5, color: "#6b7280", marginBottom: 12 },

  wash: { position: "absolute", left: 0, right: 0, bottom: 0, height: 260 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center", paddingTop: 10 },
  cta: { backgroundColor: RED, borderRadius: 999, paddingVertical: 16, paddingHorizontal: 44 },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  editLink: { color: "#374151", fontWeight: "700", fontSize: 13 },

  reviewHero: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#EBF3EF", borderRadius: 20, padding: 14, marginBottom: 14 },
  reviewThumb: { width: 96, height: 96, borderRadius: 14, backgroundColor: "#D1D5DB", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  reviewName: { fontSize: 22, fontWeight: "900", color: "#111827" },
  reviewColor: { fontSize: 14, color: "#374151", marginTop: 4 },
  reviewBrand: { fontSize: 12.5, color: "#6b7280", marginTop: 2 },
  compare: { flexDirection: "row", backgroundColor: "#F1F7F4", borderRadius: 20, padding: 14, marginBottom: 12 },
  compareCol: { flex: 1 },
  divider: { width: 1, backgroundColor: "#CBD5E1", marginHorizontal: 12 },
  compareHead: { fontSize: 11, fontWeight: "900", color: GREEN, textTransform: "uppercase", marginBottom: 8 },
  reviewLabel: { fontSize: 12, fontWeight: "800", color: "#111827" },
  reviewValue: { fontSize: 12, color: "#6b7280", marginTop: 1 },

  analyzingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", zIndex: 50 },
  analyzingCard: { backgroundColor: "white", borderRadius: 20, paddingVertical: 24, paddingHorizontal: 28, alignItems: "center", maxWidth: 300 },
  analyzingText: { marginTop: 12, fontSize: 15, fontWeight: "800", color: GREEN },
  analyzingSub: { marginTop: 4, fontSize: 12, color: "#6b7280", textAlign: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(17,20,36,0.75)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: "70%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: GREEN, textAlign: "center", marginBottom: 12 },
  modalSub: { fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 14 },
  photoOption: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 14 },
  photoOptionIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E3EEE7", justifyContent: "center", alignItems: "center" },
  photoOptionText: { fontSize: 14, fontWeight: "700", color: "#374151" },
  photoOptionSub: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  categoryOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  categoryOptionText: { fontSize: 14, color: "#374151", fontWeight: "600" },
  categoryOptionTextActive: { color: GREEN, fontWeight: "800" },

  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 190, marginBottom: 14 },
  timeCol: { width: 80, height: 190 },
  timeColon: { fontSize: 22, fontWeight: "900", color: "#111827", marginHorizontal: 4 },
  timeItem: { paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  timeItemOn: { backgroundColor: "#E3EEE7" },
  timeText: { fontSize: 18, color: "#9ca3af", fontWeight: "600" },
  timeTextOn: { color: GREEN, fontWeight: "900" },
  timeDone: { backgroundColor: GREEN, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  timeDoneText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },

  centerOverlay: { flex: 1, backgroundColor: "rgba(17,20,36,0.75)", alignItems: "center", justifyContent: "center", padding: 24 },
  confirmBox: { backgroundColor: "white", borderRadius: 24, padding: 24, width: "100%", maxWidth: 380, alignItems: "center" },
  confirmTitle: { fontSize: 18, fontWeight: "900", color: "#111827", textAlign: "center", marginTop: 10, marginBottom: 6 },
  confirmSub: { fontSize: 12, color: "#4b5563", textAlign: "center", marginBottom: 16, lineHeight: 17 },
  confirmRow: { flexDirection: "row", gap: 12, alignSelf: "stretch" },
  cancelBtn: { flex: 1, backgroundColor: RED, borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  confirmBtn: { flex: 1, backgroundColor: "#475569", borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  homeBtn: { flex: 1, backgroundColor: "#475569", borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  btnText: { color: "white", fontWeight: "800", fontSize: 13 },
  checkCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center", marginTop: 10 },
  reminderBox: { backgroundColor: "#fff7ed", borderRadius: 14, padding: 12, marginBottom: 16, alignSelf: "stretch" },
  reminderTitle: { fontSize: 12, fontWeight: "800", color: "#c2410c", marginBottom: 3 },
  reminderText: { fontSize: 11, color: "#c2410c", lineHeight: 15 },
});