package com.samayghadi.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import java.util.Map;

public class BootReceiver extends BroadcastReceiver {
    private static final String PREFS_NAME = "SanatanAlarmRegistry";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || "android.intent.action.QUICKBOOT_POWERON".equals(action)
                || "com.htc.intent.action.QUICKBOOT_POWERON".equals(action)) {

            rescheduleAllAlarms(context);
        }
    }

    private void rescheduleAllAlarms(Context context) {
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
            // Format: label:::triggerTimeMs:::vibrate:::snoozeMinutes:::ringtoneUri
            String[] parts = serialized.split(":::", -1);
            if (parts.length < 5) continue;

            String label = parts[0];
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

            String ringtoneUri = parts[4];

            // If the alarm has expired while the phone was off, prune it
            if (triggerTimeMs <= now) {
                editor.remove(id);
                continue;
            }

            Intent alarmIntent = new Intent(context, AlarmReceiver.class);
            alarmIntent.putExtra("alarmId", id);
            alarmIntent.putExtra("alarmLabel", label);
            alarmIntent.putExtra("vibrate", vibrate);
            alarmIntent.putExtra("snoozeMinutes", snoozeMinutes);
            alarmIntent.putExtra("ringtoneUri", ringtoneUri);

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
