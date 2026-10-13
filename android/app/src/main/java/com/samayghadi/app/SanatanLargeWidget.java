package com.samayghadi.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import android.app.PendingIntent;
import android.os.Build;
import android.widget.RemoteViews;

public class SanatanLargeWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences sharedPref = context.getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
        String tithi = sharedPref.getString("tithi", "लोअडिंग...");
        String nakshatra = sharedPref.getString("nakshatra", "लोअडिंग...");
        String choghadiya = sharedPref.getString("choghadiya", "—");
        String choghadiyaTime = sharedPref.getString("choghadiyaTime", "—");
        String rahuKaal = sharedPref.getString("rahuKaal", "—");
        String brahma = sharedPref.getString("brahma", "—");
        String abhijit = sharedPref.getString("abhijit", "—");

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_large);
            
            views.setTextViewText(R.id.widget_tithi, tithi);
            views.setTextViewText(R.id.widget_nakshatra, nakshatra);
            views.setTextViewText(R.id.widget_choghadiya_name, "सक्रिय चौघड़िया: " + choghadiya);
            views.setTextViewText(R.id.widget_choghadiya_time, "समय: " + choghadiyaTime);
            views.setTextViewText(R.id.widget_rahu_kaal, rahuKaal);
            views.setTextViewText(R.id.widget_brahma, brahma);
            views.setTextViewText(R.id.widget_abhijit, abhijit);

            Intent launchIntent = new Intent(context, MainActivity.class);
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
