package com.samayghadi.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String CHANNEL_ID = "sanatan_alarm_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        String alarmId = intent.getStringExtra("alarmId");
        String alarmLabel = intent.getStringExtra("alarmLabel");
        boolean vibrate = intent.getBooleanExtra("vibrate", true);
        int snoozeMinutes = intent.getIntExtra("snoozeMinutes", 2);
        String ringtoneUri = intent.getStringExtra("ringtoneUri");

        if (alarmLabel == null) {
            alarmLabel = "साधना एवं शुभ मुहूर्त";
        }

        createNotificationChannel(context);

        // Intent to launch AlarmRingerActivity
        Intent ringerIntent = new Intent(context, AlarmRingerActivity.class);
        ringerIntent.putExtra("alarmId", alarmId);
        ringerIntent.putExtra("alarmLabel", alarmLabel);
        ringerIntent.putExtra("vibrate", vibrate);
        ringerIntent.putExtra("snoozeMinutes", snoozeMinutes);
        ringerIntent.putExtra("ringtoneUri", ringtoneUri);
        ringerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_MUTABLE;
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                alarmId != null ? alarmId.hashCode() : 0,
                ringerIntent,
                flags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle(alarmLabel)
                .setContentText("उठें और साधना प्रारंभ करें!")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setAutoCancel(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.notify(alarmId != null ? alarmId.hashCode() : 1, builder.build());
        }
        
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
