package com.samayghadi.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import android.app.PendingIntent;
import android.os.Build;
import android.widget.RemoteViews;

public class SanatanAnalogWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences sharedPref = context.getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
        String choghadiya = sharedPref.getString("choghadiya", "—");

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_analog);
            
            views.setTextViewText(R.id.widget_choghadiya_name, "चौघड़िया: " + choghadiya.split(" ")[0]);

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
