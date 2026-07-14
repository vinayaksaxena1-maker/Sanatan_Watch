package com.samayghadi.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import android.app.PendingIntent;
import android.os.Build;
import android.widget.RemoteViews;

public class SanatanAppWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // Read data from SharedPreferences
        SharedPreferences sharedPref = context.getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
        String tithi = sharedPref.getString("tithi", "लोअडिंग...");
        String nakshatra = sharedPref.getString("nakshatra", "लोअडिंग...");
        String choghadiya = sharedPref.getString("choghadiya", "सक्रिय चौघड़िया: —");
        String choghadiyaTime = sharedPref.getString("choghadiyaTime", "समय: —");
        String rahuKaal = sharedPref.getString("rahuKaal", "—");

        // Update each instance of the widget
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
            
            // Set dynamic text views
            views.setTextViewText(R.id.widget_tithi, tithi);
            views.setTextViewText(R.id.widget_nakshatra, nakshatra);
            views.setTextViewText(R.id.widget_choghadiya_name, "सक्रिय चौघड़िया: " + choghadiya);
            views.setTextViewText(R.id.widget_choghadiya_time, "समय: " + choghadiyaTime);
            views.setTextViewText(R.id.widget_rahu_kaal, rahuKaal);

            // Add click intent to open main activity
            Intent launchIntent = new Intent(context, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context, 
                    0, 
                    launchIntent, 
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );
            views.setOnClickPendingIntent(R.id.widget_container_root, pendingIntent);

            // Notify Widget Manager
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Perform setup if needed when first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Cleanup if needed
    }
}
