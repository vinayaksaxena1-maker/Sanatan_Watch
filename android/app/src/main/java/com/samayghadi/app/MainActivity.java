package com.samayghadi.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.SharedPreferences;

public class MainActivity extends BridgeActivity {
    private static final int RINGTONE_PICKER_REQUEST_CODE = 999;
    private String pendingAlarmIdForRingtone = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Enable edge-to-edge layout so content fills the entire display under system bars
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // Make the system bars fully transparent to avoid white/black gap overlays
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
        }

        // Apply Sticky Immersive Mode initially
        hideSystemBarsInternal();

        // Register a JS interface to let React code hide/show system bars if ever needed
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void hideSystemBars() {
                    runOnUiThread(() -> hideSystemBarsInternal());
                }

                @JavascriptInterface
                public void showSystemBars() {
                    runOnUiThread(() -> showSystemBarsInternal());
                }
            }, "AndroidFullScreen");

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

                @JavascriptInterface
                public void scheduleAlarm(String id, String label, long triggerTimeMs, boolean vibrate, int snoozeMinutes, String ringtoneUri) {
                    AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                    Intent intent = new Intent(MainActivity.this, AlarmReceiver.class);
                    intent.putExtra("alarmId", id);
                    intent.putExtra("alarmLabel", label);
                    intent.putExtra("vibrate", vibrate);
                    intent.putExtra("snoozeMinutes", snoozeMinutes);
                    intent.putExtra("ringtoneUri", ringtoneUri);

                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        flags |= PendingIntent.FLAG_MUTABLE;
                    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        flags |= PendingIntent.FLAG_IMMUTABLE;
                    }

                    PendingIntent pendingIntent = PendingIntent.getBroadcast(
                            MainActivity.this,
                            id != null ? id.hashCode() : 0,
                            intent,
                            flags
                    );

                    if (alarmManager != null) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            if (alarmManager.canScheduleExactAlarms()) {
                                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                            } else {
                                try {
                                    Intent permissionIntent = new Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                                    startActivity(permissionIntent);
                                } catch (Exception e) {
                                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                                }
                            }
                        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                        } else {
                            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                        }
                    }
                }

                @JavascriptInterface
                public void cancelAlarm(String id) {
                    AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                    Intent intent = new Intent(MainActivity.this, AlarmReceiver.class);

                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        flags |= PendingIntent.FLAG_MUTABLE;
                    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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
                public void updateWidgetData(String tithi, String nakshatra, String choghadiya, String choghadiyaTime, String rahuKaal) {
                    try {
                        SharedPreferences sharedPref = getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
                        SharedPreferences.Editor editor = sharedPref.edit();
                        editor.putString("tithi", tithi);
                        editor.putString("nakshatra", nakshatra);
                        editor.putString("choghadiya", choghadiya);
                        editor.putString("choghadiyaTime", choghadiyaTime);
                        editor.putString("rahuKaal", rahuKaal);
                        editor.apply();

                        // Trigger widget broadcast update
                        Context appCtx = getApplicationContext();
                        Intent intent = new Intent(appCtx, SanatanAppWidget.class);
                        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        int[] ids = AppWidgetManager.getInstance(appCtx)
                                .getAppWidgetIds(new ComponentName(appCtx, SanatanAppWidget.class));
                        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
                        sendBroadcast(intent);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }, "AndroidAlarm");
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

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBarsInternal();
        }
    }

    private void hideSystemBarsInternal() {
        Window window = getWindow();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            // Hide both Status Bar and Navigation Bar
            controller.hide(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.navigationBars());
            // Configure swipe gesture behavior to show transient bars (Sticky Immersive Mode)
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        } else {
            // Fallback for older Android versions
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }

    private void showSystemBarsInternal() {
        Window window = getWindow();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            // Show Status Bar and Navigation Bar
            controller.show(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.navigationBars());
        } else {
            // Fallback for older Android versions
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        }
    }
}
