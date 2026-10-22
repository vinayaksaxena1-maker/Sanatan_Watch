package com.samayghadi.app;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class AlarmRingerActivity extends Activity {
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private String alarmId;
    private String alarmLabel;
    private String subtitleText;
    private boolean vibrateOption = true;
    private int snoozeMinutes = 2;
    private String ringtoneUriString = "";
    private TextView titleView;
    private Button snoozeButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Bypass Lock Screen and wake up screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (km != null) {
                km.requestDismissKeyguard(this, null);
            }
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            );
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // 2. Extract Intent Extras
        alarmId = getIntent().getStringExtra("alarm_id");
        if (alarmId == null) alarmId = getIntent().getStringExtra("alarmId");

        alarmLabel = getIntent().getStringExtra("title");
        if (alarmLabel == null) alarmLabel = getIntent().getStringExtra("alarmLabel");
        if (alarmLabel == null) alarmLabel = "साधना एवं शुभ मुहूर्त";

        subtitleText = getIntent().getStringExtra("subtitle");
        if (subtitleText == null) subtitleText = "शुभ समय प्रारंभ हो चुका है।";

        vibrateOption = getIntent().getBooleanExtra("vibrate", true);
        snoozeMinutes = getIntent().getIntExtra("snooze_min", getIntent().getIntExtra("snoozeMinutes", 2));

        ringtoneUriString = getIntent().getStringExtra("tone");
        if (ringtoneUriString == null) ringtoneUriString = getIntent().getStringExtra("ringtoneUri");
        if (ringtoneUriString == null) ringtoneUriString = "";

        // 3. Setup UI Layout programmatically (Dark Vedic theme)
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        layout.setBackgroundColor(Color.parseColor("#17120F")); // Premium dark theme
        layout.setPadding(50, 50, 50, 50);

        // Icon representation (bell emoji)
        TextView iconView = new TextView(this);
        iconView.setText("🔔");
        iconView.setTextSize(64);
        iconView.setGravity(Gravity.CENTER);
        layout.addView(iconView);

        // Alarm Title Label
        titleView = new TextView(this);
        titleView.setText(alarmLabel);
        titleView.setTextSize(26);
        titleView.setTextColor(Color.parseColor("#FFD54F")); // Amber color
        titleView.setTypeface(null, Typeface.BOLD);
        titleView.setGravity(Gravity.CENTER);
        titleView.setPadding(0, 40, 0, 10);
        layout.addView(titleView);

        // Subtitle message
        TextView subtitleView = new TextView(this);
        subtitleView.setText(subtitleText);
        subtitleView.setTextSize(16);
        subtitleView.setTextColor(Color.parseColor("#B0BEC5")); // Greyish white
        subtitleView.setGravity(Gravity.CENTER);
        subtitleView.setPadding(0, 0, 0, 80);
        layout.addView(subtitleView);

        // Dismiss Button
        Button dismissButton = new Button(this);
        dismissButton.setText("पूजा प्रारंभ करें (Dismiss)");
        dismissButton.setBackgroundColor(Color.parseColor("#E65100")); // Deep orange
        dismissButton.setTextColor(Color.WHITE);
        dismissButton.setTextSize(16);
        dismissButton.setTypeface(null, Typeface.BOLD);
        dismissButton.setPadding(40, 30, 40, 30);

        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        btnParams.setMargins(0, 0, 0, 30);
        dismissButton.setLayoutParams(btnParams);

        dismissButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                cancelStatusBarNotification();
                SanatanAlarmRegistry.removeAlarm(AlarmRingerActivity.this, alarmId);
                stopAlarmMedia();
                launchMainActivity();
                finish();
            }
        });
        layout.addView(dismissButton);

        // Snooze Button
        snoozeButton = new Button(this);
        snoozeButton.setText("सूनोज़ (" + snoozeMinutes + " मिनट बाद)");
        snoozeButton.setBackgroundColor(Color.TRANSPARENT);
        snoozeButton.setTextColor(Color.parseColor("#FFB74D")); // Light amber
        snoozeButton.setTextSize(14);
        snoozeButton.setPadding(30, 20, 30, 20);
        snoozeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                cancelStatusBarNotification();
                stopAlarmMedia();
                snoozeAlarm();
                finish();
            }
        });
        layout.addView(snoozeButton);

        setContentView(layout);

        // 4. Start ringing and vibrating
        startAlarmMedia();
    }

    private void startAlarmMedia() {
        // Vibrator setup
        if (vibrateOption) {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                long[] pattern = {0, 800, 800}; // vibrate 800ms, pause 800ms
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
                } else {
                    vibrator.vibrate(pattern, 0);
                }
            }
        }

        // Media Player setup
        try {
            mediaPlayer = new MediaPlayer();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build());
            }

            boolean loaded = false;

            // 1. Try loading custom picked URI if provided
            if (!ringtoneUriString.isEmpty() && !ringtoneUriString.equals("SYSTEM_DEFAULT")) {
                try {
                    mediaPlayer.setDataSource(this, Uri.parse(ringtoneUriString));
                    mediaPlayer.prepare();
                    loaded = true;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // 2. Try loading system default alarm if requested or custom failed
            if (!loaded && ringtoneUriString.equals("SYSTEM_DEFAULT")) {
                try {
                    Uri defaultAlarmUri = android.provider.Settings.System.DEFAULT_ALARM_ALERT_URI;
                    if (defaultAlarmUri == null) {
                        defaultAlarmUri = android.provider.Settings.System.DEFAULT_NOTIFICATION_URI;
                    }
                    mediaPlayer.setDataSource(this, defaultAlarmUri);
                    mediaPlayer.prepare();
                    loaded = true;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // 3. Try loading app bundled sound file (Flute)
            if (!loaded) {
                try {
                    int resId = getResources().getIdentifier("alarm_sound", "raw", getPackageName());
                    if (resId != 0) {
                        mediaPlayer.release();
                        mediaPlayer = MediaPlayer.create(this, resId);
                        loaded = true;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // 4. Ultimate fallback to default system notification sound
            if (!loaded) {
                mediaPlayer = new MediaPlayer();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build());
                }
                Uri fallbackUri = android.provider.Settings.System.DEFAULT_ALARM_ALERT_URI;
                if (fallbackUri == null) {
                    fallbackUri = android.provider.Settings.System.DEFAULT_NOTIFICATION_URI;
                }
                mediaPlayer.setDataSource(this, fallbackUri);
                mediaPlayer.prepare();
            }

            mediaPlayer.setLooping(true);
            mediaPlayer.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void stopAlarmMedia() {
        if (mediaPlayer != null) {
            try {
                mediaPlayer.stop();
                mediaPlayer.release();
            } catch (Exception e) {
                e.printStackTrace();
            }
            mediaPlayer = null;
        }

        if (vibrator != null) {
            try {
                vibrator.cancel();
            } catch (Exception e) {
                e.printStackTrace();
            }
            vibrator = null;
        }
    }

    private void snoozeAlarm() {
        AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(this, AlarmReceiver.class);
        intent.putExtra("alarmId", alarmId);
        intent.putExtra("alarm_id", alarmId);
        intent.putExtra("alarmLabel", alarmLabel);
        intent.putExtra("title", alarmLabel);
        intent.putExtra("subtitle", subtitleText);
        intent.putExtra("vibrate", vibrateOption);
        intent.putExtra("snoozeMinutes", snoozeMinutes);
        intent.putExtra("snooze_min", snoozeMinutes);
        intent.putExtra("ringtoneUri", ringtoneUriString);
        intent.putExtra("tone", ringtoneUriString);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                this,
                alarmId != null ? alarmId.hashCode() : 0,
                intent,
                flags
        );

        long triggerTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L);

        if (alarmManager != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                    } else {
                        alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                }
            } catch (SecurityException se) {
                se.printStackTrace();
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        SanatanAlarmRegistry.updateSnooze(this, alarmId, triggerTime);
    }

    private void cancelStatusBarNotification() {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(alarmId != null ? alarmId.hashCode() : 1);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void launchMainActivity() {
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        startActivity(launchIntent);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);

        cancelStatusBarNotification();
        stopAlarmMedia();
    }

    @Override
    protected void onDestroy() {
        stopAlarmMedia();
        super.onDestroy();
    }
}
