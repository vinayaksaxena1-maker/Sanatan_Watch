package com.samayghadi.app;

import android.app.Activity;
import android.app.AlarmManager;
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
    private boolean vibrateOption = true;
    private int snoozeMinutes = 2;
    private String ringtoneUriString = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Bypass Lock Screen and wake up screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            );
        }

        alarmId = getIntent().getStringExtra("alarmId");
        alarmLabel = getIntent().getStringExtra("alarmLabel");
        vibrateOption = getIntent().getBooleanExtra("vibrate", true);
        snoozeMinutes = getIntent().getIntExtra("snoozeMinutes", 2);
        ringtoneUriString = getIntent().getStringExtra("ringtoneUri");
        if (ringtoneUriString == null) {
            ringtoneUriString = "";
        }

        if (alarmLabel == null) {
            alarmLabel = "साधना एवं शुभ मुहूर्त";
        }

        // Setup UI Layout programmatically
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
        TextView titleView = new TextView(this);
        titleView.setText(alarmLabel);
        titleView.setTextSize(26);
        titleView.setTextColor(Color.parseColor("#FFD54F")); // Amber color
        titleView.setTypeface(null, Typeface.BOLD);
        titleView.setGravity(Gravity.CENTER);
        titleView.setPadding(0, 40, 0, 10);
        layout.addView(titleView);

        // Subtitle message
        TextView subtitleView = new TextView(this);
        subtitleView.setText("शुभ समय प्रारंभ हो चुका है।");
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
                stopAlarmMedia();
                launchMainActivity();
                finish();
            }
        });
        layout.addView(dismissButton);

        // Snooze Button
        Button snoozeButton = new Button(this);
        snoozeButton.setText("सूनोज़ (" + snoozeMinutes + " मिनट बाद)");
        snoozeButton.setBackgroundColor(Color.TRANSPARENT);
        snoozeButton.setTextColor(Color.parseColor("#FFB74D")); // Light amber
        snoozeButton.setTextSize(14);
        snoozeButton.setPadding(30, 20, 30, 20);
        snoozeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopAlarmMedia();
                snoozeAlarm();
                finish();
            }
        });
        layout.addView(snoozeButton);

        setContentView(layout);

        // Start ringing and vibrating
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
            
            // Set audio attributes
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
                    e.printStackTrace(); // fallback
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
            
            // 3. Try loading app bundled sound file
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
        intent.putExtra("alarmLabel", alarmLabel);
        intent.putExtra("vibrate", vibrateOption);
        intent.putExtra("snoozeMinutes", snoozeMinutes);
        intent.putExtra("ringtoneUri", ringtoneUriString);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_MUTABLE;
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                this,
                alarmId != null ? alarmId.hashCode() : 0,
                intent,
                flags
        );

        long triggerTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000); // dynamic snooze duration

        if (alarmManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
            }
        }
    }

    private void launchMainActivity() {
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        startActivity(launchIntent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopAlarmMedia();
    }

    @Override
    public void onBackPressed() {
        stopAlarmMedia();
        snoozeAlarm();
        super.onBackPressed();
    }
}
