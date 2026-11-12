import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { validHours, validMinutes, formatTime } from "../lib/reportTime";

// Hour and minute columns for any minute from 6:00 AM to 7:00 PM, limited to now on today
export default function TimePickerBody({ date, current, color, onPick }: { date: string; current: string; color: string; onPick: (t: string) => void }) {
  const hours = validHours(date);
  const [h, setH] = useState<number | null>(null);
  const [m, setM] = useState<number | null>(null);

  useEffect(() => {
    const mm = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(current || "");
    if (mm) {
      let hh = Number(mm[1]) % 12;
      if (mm[3] === "PM") hh += 12;
      setH(hh);
      setM(Number(mm[2]));
    }
  }, []);

  if (hours.length === 0) {
    return <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600", paddingVertical: 12 }}>No time is available yet today. Choose an earlier date.</Text>;
  }

  const minutes = h === null ? [] : validMinutes(date, h);
  const ready = h !== null && m !== null && minutes.includes(m);
  const hourLabel = (x: number) => `${x % 12 === 0 ? 12 : x % 12} ${x >= 12 ? "PM" : "AM"}`;

  return (
    <View>
      <View style={s.row}>
        <ScrollView style={s.col} showsVerticalScrollIndicator={false}>
          {hours.map((x) => (
            <TouchableOpacity key={x} style={[s.item, h === x && { backgroundColor: "#E3EEE7" }]} onPress={() => { setH(x); if (m !== null && !validMinutes(date, x).includes(m)) setM(null); }}>
              <Text style={[s.text, h === x && { color, fontWeight: "900" }]}>{hourLabel(x)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={s.colon}>:</Text>
        <ScrollView style={s.col} showsVerticalScrollIndicator={false}>
          {h === null ? (
            <Text style={[s.text, { textAlign: "center", fontSize: 12, paddingTop: 10 }]}>Pick the hour</Text>
          ) : (
            minutes.map((x) => (
              <TouchableOpacity key={x} style={[s.item, m === x && { backgroundColor: "#E3EEE7" }]} onPress={() => setM(x)}>
                <Text style={[s.text, m === x && { color, fontWeight: "900" }]}>{String(x).padStart(2, "0")}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
      <TouchableOpacity
        disabled={!ready}
        activeOpacity={0.9}
        onPress={() => onPick(formatTime(h as number, m as number))}
        style={{ backgroundColor: color, borderRadius: 999, paddingVertical: 14, alignItems: "center", opacity: ready ? 1 : 0.4 }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>Set time</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center", height: 190, marginBottom: 14 },
  col: { width: 90, height: 190 },
  colon: { fontSize: 22, fontWeight: "900", color: "#111827", marginHorizontal: 4, marginTop: 70 },
  item: { paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  text: { fontSize: 18, color: "#9ca3af", fontWeight: "600" },
});