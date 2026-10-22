package com.samayghadi.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import java.util.Map;

/**
 * Registry to persist scheduled alarms in SharedPreferences
 * and re-arm them upon device reboot or deep-sleep recovery.
 */
public class SanatanAlarmRegistry {
    public static final String PREFS_NAME = "SanatanAlarmRegistry";

    public static void saveAlarm(Context context, String alarmId, String title, String subtitle,
                                 long triggerTimeMs, String tone, boolean vibrate, int snoozeMinutes) {
        if (alarmId == null || context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            // Format: title:::triggerTimeMs:::vibrate:::snoozeMinutes:::tone:::subtitle
            String serialized = (title != null ? title : "") + ":::" +
                                triggerTimeMs + ":::" +
                                vibrate + ":::" +
                                snoozeMinutes + ":::" +
                                (tone != null ? tone : "") + ":::" +
                                (subtitle != null ? subtitle : "");
            prefs.edit().putString(alarmId, serialized).apply();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void removeAlarm(Context context, String alarmId) {
        if (alarmId == null || context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().remove(alarmId).apply();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateSnooze(Context context, String alarmId, long newTriggerTimeMs) {
        if (alarmId == null || context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String existing = prefs.getString(alarmId, null);
            if (existing != null) {
                String[] parts = existing.split(":::", -1);
                if (parts.length >= 5) {
                    String title = parts[0];
                    boolean vibrate = Boolean.parseBoolean(parts[2]);
                    int snoozeMinutes = 2;
                    try {
                        snoozeMinutes = Integer.parseInt(parts[3]);
                    } catch (NumberFormatException ignored) {}
                    String tone = parts[4];
                    String subtitle = parts.length > 5 ? parts[5] : "शुभ समय प्रारंभ हो चुका है।";

                    saveAlarm(context, alarmId, title, subtitle, newTriggerTimeMs, tone, vibrate, snoozeMinutes);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void rescheduleAllPendingAlarms(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        Map<String, ?> allAlarms = prefs.getAll();
        if (allAlarms == null || allAlarms.isEmpty()) {
            return;
        }

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        long now = System.currentTimeMillis();
        SharedPreferences.Editor editor = prefs.edit();

        for (Map.Entry<String, ?> entry : allAlarms.entrySet()) {
            String id = entry.getKey();
            Object value = entry.getValue();

            if (!(value instanceof String)) continue;
            String serialized = (String) value;
            // Format: title:::triggerTimeMs:::vibrate:::snoozeMinutes:::tone:::subtitle
            String[] parts = serialized.split(":::", -1);
            if (parts.length < 5) continue;

            String title = parts[0];
            long triggerTimeMs;
            try {
                triggerTimeMs = Long.parseLong(parts[1]);
            } catch (NumberFormatException e) {
                editor.remove(id);
                continue;
            }

            boolean vibrate = Boolean.parseBoolean(parts[2]);
            int snoozeMinutes = 2;
            try {
                snoozeMinutes = Integer.parseInt(parts[3]);
            } catch (NumberFormatException ignored) {}

            String tone = parts[4];
            String subtitle = parts.length > 5 ? parts[5] : "शुभ समय प्रारंभ हो चुका है।";

            // If the alarm has expired while the phone was off, prune it
            if (triggerTimeMs <= now) {
                editor.remove(id);
                continue;
            }

            Intent alarmIntent = new Intent(context, AlarmReceiver.class);
            alarmIntent.putExtra("alarmId", id);
            alarmIntent.putExtra("alarm_id", id);
            alarmIntent.putExtra("alarmLabel", title);
            alarmIntent.putExtra("title", title);
            alarmIntent.putExtra("subtitle", subtitle);
            alarmIntent.putExtra("vibrate", vibrate);
            alarmIntent.putExtra("snoozeMinutes", snoozeMinutes);
            alarmIntent.putExtra("snooze_min", snoozeMinutes);
            alarmIntent.putExtra("ringtoneUri", tone);
            alarmIntent.putExtra("tone", tone);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    id != null ? id.hashCode() : 0,
                    alarmIntent,
                    flags
            );

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                    } else {
                        alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                }
            } catch (SecurityException se) {
                se.printStackTrace();
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        editor.apply();
    }
}
