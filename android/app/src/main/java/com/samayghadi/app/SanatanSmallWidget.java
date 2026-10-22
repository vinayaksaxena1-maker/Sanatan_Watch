package com.samayghadi.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.widget.RemoteViews;

public class SanatanSmallWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences sharedPref = context.getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
        
        String tithi = sharedPref.getString("tithi", "—");
        String nakshatra = sharedPref.getString("nakshatra", "");
        String choghadiyaName = sharedPref.getString("choghadiyaName", sharedPref.getString("choghadiya", "लाभ"));
        String choghadiyaType = sharedPref.getString("choghadiyaType", "shubh");
        String choghadiyaTime = sharedPref.getString("choghadiyaTime", "—");
        int remainingMin = sharedPref.getInt("remainingMinutes", 0);
        String city = sharedPref.getString("cityName", sharedPref.getString("city", ""));

        // Determine Color and Dot for 2x2 widget
        String dot = "🟢";
        int textColor = Color.parseColor("#4ADE80");
        String qualityText = "शुभ समय";

        if ("ashubh".equalsIgnoreCase(choghadiyaType)) {
            dot = "🔴";
            textColor = Color.parseColor("#F87171");
            qualityText = "अशुभ समय";
        } else if ("madhyam".equalsIgnoreCase(choghadiyaType)) {
            dot = "🟡";
            textColor = Color.parseColor("#FACC15");
            qualityText = "मध्यम समय";
        }

        String choghadiyaDisplay = dot + " " + choghadiyaName + " चौघड़िया";
        String remainingDisplay = remainingMin > 0 
                ? ("⏳ " + remainingMin + " मिनट शेष (" + qualityText + ")")
                : ("⏳ " + qualityText);
        String cityDisplay = city.isEmpty() ? "📍 सनातन" : ("📍 " + city);
        String tithiDisplay = "📅 " + tithi + (nakshatra.isEmpty() || nakshatra.equals("—") ? "" : " • " + nakshatra);

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_small);
            
            // Header
            views.setTextViewText(R.id.widget_small_title, "ॐ सनातन घड़ी");
            views.setTextViewText(R.id.widget_small_city, cityDisplay);

            // Choghadiya block
            views.setTextViewText(R.id.widget_small_choghadiya, choghadiyaDisplay);
            views.setTextColor(R.id.widget_small_choghadiya, textColor);
            views.setTextViewText(R.id.widget_small_time, choghadiyaTime);
            views.setTextViewText(R.id.widget_small_remaining, remainingDisplay);

            // Footer
            views.setTextViewText(R.id.widget_small_tithi, tithiDisplay);

            // Click Intent to launch MainActivity
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context, 
                    0, 
                    launchIntent, 
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );
            views.setOnClickPendingIntent(R.id.widget_container_root, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
