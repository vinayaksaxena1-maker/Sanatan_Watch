package com.samayghadi.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String CHANNEL_ID = "sanatan_alarm_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;

        // 1. Acquire WakeLock so device stays awake during Doze mode / deep sleep
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            try {
                PowerManager.WakeLock wakeLock = pm.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                    "SanatanWatch:AlarmWakeLock"
                );
                wakeLock.acquire(10 * 1000L /* 10 seconds */);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // 2. Extract Intent Extras (supporting both old & new parameter keys)
        String alarmId = intent.getStringExtra("alarm_id");
        if (alarmId == null) alarmId = intent.getStringExtra("alarmId");

        String title = intent.getStringExtra("title");
        if (title == null) title = intent.getStringExtra("alarmLabel");
        if (title == null) title = "साधना एवं शुभ मुहूर्त";

        String subtitle = intent.getStringExtra("subtitle");
        if (subtitle == null) subtitle = "उठें और साधना प्रारंभ करें!";

        boolean vibrate = intent.getBooleanExtra("vibrate", true);
        int snoozeMinutes = intent.getIntExtra("snooze_min", intent.getIntExtra("snoozeMinutes", 2));

        String tone = intent.getStringExtra("tone");
        if (tone == null) tone = intent.getStringExtra("ringtoneUri");

        createNotificationChannel(context);

        // 3. Build Full-Screen Intent for AlarmRingerActivity
        Intent ringerIntent = new Intent(context, AlarmRingerActivity.class);
        ringerIntent.putExtras(intent);
        ringerIntent.putExtra("alarmId", alarmId);
        ringerIntent.putExtra("alarm_id", alarmId);
        ringerIntent.putExtra("alarmLabel", title);
        ringerIntent.putExtra("title", title);
        ringerIntent.putExtra("subtitle", subtitle);
        ringerIntent.putExtra("vibrate", vibrate);
        ringerIntent.putExtra("snoozeMinutes", snoozeMinutes);
        ringerIntent.putExtra("snooze_min", snoozeMinutes);
        ringerIntent.putExtra("ringtoneUri", tone);
        ringerIntent.putExtra("tone", tone);
        ringerIntent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
        );

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                alarmId != null ? alarmId.hashCode() : 0,
                ringerIntent,
                flags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification_om)
                .setContentTitle(title)
                .setContentText(subtitle)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setAutoCancel(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.notify(alarmId != null ? alarmId.hashCode() : 1, builder.build());
        }

        // 4. Directly launch Activity
        try {
            context.startActivity(ringerIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Sanatan Alarm Channel";
            String description = "Alarms and Muhurat alerts for Samay Ghadi";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.setSound(null, null);
            channel.enableVibration(false);

            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
