package com.samayghadi.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.WallpaperManager;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.app.NotificationCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayOutputStream;

public class MainActivity extends BridgeActivity {
    private static final int RINGTONE_PICKER_REQUEST_CODE = 999;
    private static final String PERMANENT_CHANNEL_ID = "sanatan_panchang_permanent";
    private static final int PERMANENT_NOTIFICATION_ID = 45678;
    private String pendingAlarmIdForRingtone = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Request POST_NOTIFICATIONS on Android 13+ (API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        Window window = getWindow();

        // Official Google Android Edge-to-Edge: Content extends behind transparent system bars
        WindowCompat.setDecorFitsSystemWindows(window, false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
        }

        // Disable automatic OS contrast scrim on Android 10+ (API 29+) for pure edge-to-edge transparency
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }

        // Keep system bars permanently visible (NO IMMERSIVE MODE)
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.show(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.navigationBars());
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_DEFAULT);
            controller.setAppearanceLightNavigationBars(false);
        }

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void selectRingtone(String alarmId) {
                    pendingAlarmIdForRingtone = alarmId;
                    Intent intent = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
                    intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALARM);
                    intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, "अलार्म टोन चुनें");
                    intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
                    intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
                    startActivityForResult(intent, RINGTONE_PICKER_REQUEST_CODE);
                }

                // 7-parameter version (From Architecture Implementation Plan)
                @JavascriptInterface
                public void scheduleAlarm(String alarmId, String title, String subtitle, long triggerTimeMs, String tone, boolean vibrate, int snoozeMinutes) {
                    scheduleAlarmInternal(alarmId, title, subtitle, triggerTimeMs, tone, vibrate, snoozeMinutes);
                }

                // 6-parameter version (Backwards compatible with existing TypeScript/React calls)
                @JavascriptInterface
                public void scheduleAlarm(String id, String label, long triggerTimeMs, boolean vibrate, int snoozeMinutes, String ringtoneUri) {
                    scheduleAlarmInternal(id, label, "शुभ समय प्रारंभ हो चुका है।", triggerTimeMs, ringtoneUri, vibrate, snoozeMinutes);
                }

                @JavascriptInterface
                public void cancelAlarm(String id) {
                    AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                    Intent intent = new Intent(MainActivity.this, AlarmReceiver.class);

                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        flags |= PendingIntent.FLAG_IMMUTABLE;
                    }

                    PendingIntent pendingIntent = PendingIntent.getBroadcast(
                            MainActivity.this,
                            id != null ? id.hashCode() : 0,
                            intent,
                            flags
                    );

                    if (alarmManager != null && pendingIntent != null) {
                        alarmManager.cancel(pendingIntent);
                    }

                    // Remove alarm from persistent registry
                    SanatanAlarmRegistry.removeAlarm(MainActivity.this, id);
                }

                @JavascriptInterface
                public String getSystemWallpaperBase64() {
                    try {
                        WallpaperManager wm = WallpaperManager.getInstance(MainActivity.this);
                        Drawable drawable = wm.getDrawable();
                        if (drawable != null) {
                            Bitmap bitmap = null;
                            if (drawable instanceof BitmapDrawable) {
                                bitmap = ((BitmapDrawable) drawable).getBitmap();
                            } else {
                                bitmap = Bitmap.createBitmap(
                                        drawable.getIntrinsicWidth() > 0 ? drawable.getIntrinsicWidth() : 480,
                                        drawable.getIntrinsicHeight() > 0 ? drawable.getIntrinsicHeight() : 800,
                                        Bitmap.Config.ARGB_8888
                                );
                                Canvas canvas = new Canvas(bitmap);
                                drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                                drawable.draw(canvas);
                            }
                            if (bitmap != null) {
                                int maxDim = 400;
                                int w = bitmap.getWidth();
                                int h = bitmap.getHeight();
                                if (w > maxDim || h > maxDim) {
                                    float ratio = (float) w / (float) h;
                                    if (ratio > 1.0f) {
                                        w = maxDim;
                                        h = (int) (maxDim / ratio);
                                    } else {
                                        h = maxDim;
                                        w = (int) (maxDim * ratio);
                                    }
                                    bitmap = Bitmap.createScaledBitmap(bitmap, w, h, true);
                                }
                                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                                bitmap.compress(Bitmap.CompressFormat.JPEG, 60, baos);
                                return "data:image/jpeg;base64," + Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP);
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return "";
                }

                @JavascriptInterface
                public void updateWidgetData(String tithi, String nakshatra, String choghadiya, String choghadiyaTime, String rahuKaal, String brahma, String abhijit, String city) {
                    try {
                        SharedPreferences sharedPref = getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
                        SharedPreferences.Editor editor = sharedPref.edit();
                        editor.putString("tithi", tithi);
                        editor.putString("nakshatra", nakshatra);
                        editor.putString("choghadiya", choghadiya);
                        editor.putString("choghadiyaTime", choghadiyaTime);
                        editor.putString("rahuKaal", rahuKaal);
                        editor.putString("brahma", brahma);
                        editor.putString("abhijit", abhijit);
                        editor.putString("city", city);
                        editor.apply();

                        Context appCtx = getApplicationContext();
                        AppWidgetManager widgetManager = AppWidgetManager.getInstance(appCtx);

                        // 1. Update Medium Widget (SanatanAppWidget)
                        Intent intentApp = new Intent(appCtx, SanatanAppWidget.class);
                        intentApp.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        int[] idsApp = widgetManager.getAppWidgetIds(new ComponentName(appCtx, SanatanAppWidget.class));
                        intentApp.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsApp);
                        sendBroadcast(intentApp);

                        // 2. Update Small Widget (SanatanSmallWidget)
                        Intent intentSmall = new Intent(appCtx, SanatanSmallWidget.class);
                        intentSmall.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        int[] idsSmall = widgetManager.getAppWidgetIds(new ComponentName(appCtx, SanatanSmallWidget.class));
                        intentSmall.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsSmall);
                        sendBroadcast(intentSmall);

                        // 3. Update Permanent Notification
                        MainActivity.this.updatePermanentNotification();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                // Live Sticky Panchang Notification with color coding and actions
                @JavascriptInterface
                public void updatePermanentNotification(String city, String tithi, String nakshatra,
                                                        String choghadiyaName, String choghadiyaType,
                                                        int remainingMin, String abhijitTime,
                                                        String rahuTime, String dishaShool) {
                    MainActivity.this.updatePermanentNotification(city, tithi, nakshatra, choghadiyaName, choghadiyaType, remainingMin, abhijitTime, rahuTime, dishaShool);
                }

                @JavascriptInterface
                public void setPermanentNotificationEnabled(boolean enabled) {
                    try {
                        SharedPreferences sharedPref = getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
                        SharedPreferences.Editor editor = sharedPref.edit();
                        editor.putBoolean("permanentNotificationEnabled", enabled);
                        editor.apply();

                        if (enabled) {
                            MainActivity.this.updatePermanentNotification();
                        } else {
                            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                            if (notificationManager != null) {
                                notificationManager.cancel(PERMANENT_NOTIFICATION_ID);
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                @JavascriptInterface
                public boolean isPermanentNotificationEnabled() {
                    SharedPreferences sharedPref = getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
                    return sharedPref.getBoolean("permanentNotificationEnabled", false);
                }
            }, "AndroidAlarm");

            // Refresh permanent notification on app start
            updatePermanentNotification();

            // Handle potential initial notification intent
            handleNotificationIntent(getIntent());
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleNotificationIntent(intent);
    }

    private void handleNotificationIntent(Intent intent) {
        if (intent == null) return;
        String targetTab = intent.getStringExtra("target_tab");
        String action = intent.getStringExtra("action");

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            if (targetTab != null) {
                webView.post(() -> webView.evaluateJavascript(
                    "if (window.onNotificationAction) { window.onNotificationAction('tab', '" + targetTab + "'); }",
                    null
                ));
            }
            if (action != null) {
                webView.post(() -> webView.evaluateJavascript(
                    "if (window.onNotificationAction) { window.onNotificationAction('action', '" + action + "'); }",
                    null
                ));
            }
        }
    }

    private void scheduleAlarmInternal(String alarmId, String title, String subtitle, long triggerTimeMs, String tone, boolean vibrate, int snoozeMinutes) {
        AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        // Android 14+ (API 34) Exact Alarm Check
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                try {
                    Intent permIntent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    startActivity(permIntent);
                } catch (Exception ignored) {}
            }
        }

        Intent intent = new Intent(this, AlarmReceiver.class);
        intent.putExtra("alarmId", alarmId);
        intent.putExtra("alarm_id", alarmId);
        intent.putExtra("alarmLabel", title);
        intent.putExtra("title", title);
        intent.putExtra("subtitle", subtitle);
        intent.putExtra("tone", tone);
        intent.putExtra("ringtoneUri", tone);
        intent.putExtra("vibrate", vibrate);
        intent.putExtra("snoozeMinutes", snoozeMinutes);
        intent.putExtra("snooze_min", snoozeMinutes);

        int requestCode = alarmId != null ? alarmId.hashCode() : 0;
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getBroadcast(this, requestCode, intent, flags);

        // Save in persistent registry for Boot Recovery
        SanatanAlarmRegistry.saveAlarm(this, alarmId, title, subtitle, triggerTimeMs, tone, vibrate, snoozeMinutes);

        // Deep Sleep (Doze Mode) Safe Alarm
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
            try {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void updatePermanentNotification(String city, String tithi, String nakshatra,
                                            String choghadiyaName, String choghadiyaType,
                                            int remainingMin, String abhijitTime,
                                            String rahuTime, String dishaShool) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;

        SharedPreferences sharedPref = getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
        boolean enabled = sharedPref.getBoolean("permanentNotificationEnabled", false);
        if (!enabled) {
            manager.cancel(PERMANENT_NOTIFICATION_ID);
            return;
        }

        // Cache parameters to SharedPreferences for offline/cold-start recall
        SharedPreferences.Editor editor = sharedPref.edit();
        if (city != null) editor.putString("city", city);
        if (tithi != null) editor.putString("tithi", tithi);
        if (nakshatra != null) editor.putString("nakshatra", nakshatra);
        if (choghadiyaName != null) editor.putString("choghadiya", choghadiyaName);
        if (choghadiyaType != null) editor.putString("choghadiyaType", choghadiyaType);
        editor.putInt("remainingMin", remainingMin);
        if (abhijitTime != null) editor.putString("abhijit", abhijitTime);
        if (rahuTime != null) editor.putString("rahuKaal", rahuTime);
        if (dishaShool != null) editor.putString("dishaShool", dishaShool);
        editor.apply();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                PERMANENT_CHANNEL_ID,
                "ॐ सनातन पंचांग अपडेट्स",
                NotificationManager.IMPORTANCE_LOW // एकदम मूक (Silent) ताकि घंटी न बजे
            );
            channel.setDescription("दैनिक लाइव पंचांग, चौघड़िया व मुहूर्त की स्थायी सूचना");
            channel.setShowBadge(false);
            channel.setSound(null, null);
            channel.enableVibration(false);
            manager.createNotificationChannel(channel);
        }

        // Color-coded indicator
        String typeSafe = choghadiyaType != null ? choghadiyaType : "madhyam";
        String indicator = typeSafe.equalsIgnoreCase("shubh") ? "🟢" :
                          (typeSafe.equalsIgnoreCase("madhyam") ? "🟡" : "🔴");

        String cityName = (city != null && !city.isEmpty()) ? city : "सटीक स्थान";
        String tithiName = (tithi != null && !tithi.isEmpty()) ? tithi : "—";
        String nakshatraName = (nakshatra != null && !nakshatra.isEmpty()) ? nakshatra : "—";
        String chogName = (choghadiyaName != null && !choghadiyaName.isEmpty()) ? choghadiyaName : "—";
        String abhijitStr = (abhijitTime != null && !abhijitTime.isEmpty()) ? abhijitTime : "—";
        String rahuStr = (rahuTime != null && !rahuTime.isEmpty()) ? rahuTime : "—";
        String dishaStr = (dishaShool != null && !dishaShool.isEmpty()) ? dishaShool : "—";

        // Collapsed Title & Subtitle
        String contentTitle = indicator + " " + chogName + " चौघड़िया (" + remainingMin + " मि. शेष) • 📍 " + cityName;
        String contentText = tithiName + " • अभिजित: " + abhijitStr + " • राहुकाल: " + rahuStr;

        // Expanded BigText View
        String bigText = "📅 तिथि: " + tithiName + " | नक्षत्र: " + nakshatraName + "\n" +
                         "⏳ चालू चौघड़िया: " + chogName + " (" + remainingMin + " मिनट शेष)\n" +
                         "✨ अभिजित मुहूर्त: " + abhijitStr + " (शुभ कार्य)\n" +
                         "⚠️ राहुकाल: " + rahuStr + " (वर्जित समय)\n" +
                         "🚫 दिशा शूल: " + dishaStr;

        int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        // Action 1: Open Clock / Home Tab
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        openAppIntent.putExtra("target_tab", "home");
        PendingIntent pOpenApp = PendingIntent.getActivity(this, 101, openAppIntent, pendingFlags);

        // Action 2: Open Panchang Tab
        Intent panchangIntent = new Intent(this, MainActivity.class);
        panchangIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        panchangIntent.putExtra("target_tab", "panchang");
        PendingIntent pPanchang = PendingIntent.getActivity(this, 102, panchangIntent, pendingFlags);

        // Action 3: Open Poster Share Action
        Intent shareIntent = new Intent(this, MainActivity.class);
        shareIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        shareIntent.putExtra("action", "share_poster");
        PendingIntent pShare = PendingIntent.getActivity(this, 103, shareIntent, pendingFlags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, PERMANENT_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_om)
            .setContentTitle(contentTitle)
            .setContentText(contentText)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(bigText))
            .setContentIntent(pOpenApp)
            .setOngoing(true) // User cannot swipe away (Sticky)
            .setOnlyAlertOnce(true) // Updating data doesn't buzz repeatedly
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(R.drawable.ic_watch, "🕒 घड़ी", pOpenApp)
            .addAction(R.drawable.ic_panchang, "📜 पंचांग", pPanchang)
            .addAction(R.drawable.ic_share, "📲 शेयर", pShare);

        manager.notify(PERMANENT_NOTIFICATION_ID, builder.build());
    }

    private void updatePermanentNotification() {
        try {
            SharedPreferences sharedPref = getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
            boolean enabled = sharedPref.getBoolean("permanentNotificationEnabled", false);
            if (!enabled) {
                NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (notificationManager != null) {
                    notificationManager.cancel(PERMANENT_NOTIFICATION_ID);
                }
                return;
            }

            String city = sharedPref.getString("city", "सटीक स्थान");
            String tithi = sharedPref.getString("tithi", "—");
            String nakshatra = sharedPref.getString("nakshatra", "—");
            String choghadiya = sharedPref.getString("choghadiya", "—");
            String choghadiyaType = sharedPref.getString("choghadiyaType", "madhyam");
            int remainingMin = sharedPref.getInt("remainingMin", 0);
            String abhijit = sharedPref.getString("abhijit", "—");
            String rahuKaal = sharedPref.getString("rahuKaal", "—");
            String dishaShool = sharedPref.getString("dishaShool", "—");

            updatePermanentNotification(city, tithi, nakshatra, choghadiya, choghadiyaType, remainingMin, abhijit, rahuKaal, dishaShool);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RINGTONE_PICKER_REQUEST_CODE && resultCode == RESULT_OK && data != null) {
            Uri uri = data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
            if (uri != null) {
                String uriString = uri.toString();
                String ringtoneTitle = "कस्टम टोन";
                try {
                    ringtoneTitle = RingtoneManager.getRingtone(this, uri).getTitle(this);
                } catch (Exception e) {
                    e.printStackTrace();
                }

                final String finalTitle = ringtoneTitle;
                WebView webView = getBridge().getWebView();
                if (webView != null) {
                    webView.post(() -> {
                        webView.evaluateJavascript("if (window.onRingtonePicked) { window.onRingtonePicked('" + pendingAlarmIdForRingtone + "', '" + uriString + "', '" + finalTitle.replace("'", "\\'") + "'); }", null);
                    });
                }
            }
        }
    }
}
