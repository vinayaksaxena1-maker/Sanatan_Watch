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

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class SanatanAppWidget extends AppWidgetProvider {

    private String getChoghadiyaAdvice(String name) {
        if (name == null) return "ईश्वर स्मरण व दैनिक कार्य";
        String n = name.trim();
        if (n.contains("अमृत")) return "साधना, पूजा व शुभ कार्य हेतु सर्वोत्तम";
        if (n.contains("लाभ")) return "व्यापार, नए सौदे व निवेश हेतु उत्तम";
        if (n.contains("शुभ")) return "मांगलिक कार्य, मिलन व यात्रा हेतु शुभ";
        if (n.contains("चल") || n.contains("चर")) return "यात्रा, आवागमन व सामान्य कार्य अनुकूल";
        if (n.contains("रोग")) return "नया कार्य टालें, स्वास्थ्य का ध्यान रखें";
        if (n.contains("काल")) return "धन हानि का भय, नए सौदे स्थगित रखें";
        if (n.contains("उद्वेग")) return "तनाव व विवाद से बचें, शांति बनाए रखें";
        return "ईश्वर स्मरण व दैनिक कार्य";
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // Read data from SharedPreferences
        SharedPreferences sharedPref = context.getSharedPreferences("SanatanWidgetPrefs", Context.MODE_PRIVATE);
        
        String tithi = sharedPref.getString("tithi", "—");
        String choghadiyaName = sharedPref.getString("choghadiyaName", sharedPref.getString("choghadiya", "लाभ"));
        String choghadiyaType = sharedPref.getString("choghadiyaType", "shubh");
        String choghadiyaTime = sharedPref.getString("choghadiyaTime", "—");
        int remainingMin = sharedPref.getInt("remainingMinutes", 0);
        String rahuKaal = sharedPref.getString("rahuKaal", "—");
        String abhijit = sharedPref.getString("abhijit", "—");
        String dishaShool = sharedPref.getString("dishaShool", "—");
        String city = sharedPref.getString("cityName", sharedPref.getString("city", ""));

        // Format Date
        String dateStr;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("d MMM", new Locale("hi"));
            dateStr = sdf.format(new Date());
        } catch (Exception e) {
            dateStr = "";
        }

        String headerInfo = (city.isEmpty() ? "📍 सनातन" : ("📍 " + city)) 
                + (dateStr.isEmpty() ? "" : (" • " + dateStr));

        // Determine Color, Dot and Label
        String dot = "🟢";
        int textColor = Color.parseColor("#4ADE80");
        String qualityLabel = "शुभ";

        if ("ashubh".equalsIgnoreCase(choghadiyaType)) {
            dot = "🔴";
            textColor = Color.parseColor("#F87171");
            qualityLabel = "अशुभ";
        } else if ("madhyam".equalsIgnoreCase(choghadiyaType)) {
            dot = "🟡";
            textColor = Color.parseColor("#FACC15");
            qualityLabel = "मध्यम";
        }

        String badgeText = dot + " अभी: " + choghadiyaName + " (" + qualityLabel + ")";
        String remainingText = remainingMin > 0 
                ? ("⏳ " + remainingMin + " मिनट शेष") 
                : "⏳ लाइव स्थिति";
        String adviceText = "💡 " + getChoghadiyaAdvice(choghadiyaName);

        String tithiText = "📿 तिथि: " + tithi;
        String abhijitText = "✨ अभिजीत: " + abhijit;
        String rahuText = "⚠️ राहुकाल: " + rahuKaal;
        String dishaText = "🚫 दिशा शूल: " + dishaShool;

        // Update each instance of the widget
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
            
            // Header
            views.setTextViewText(R.id.widget_title, "ॐ सनातन घड़ी पंचांग");
            views.setTextViewText(R.id.widget_header_info, headerInfo);

            // Left Card: Live Choghadiya Status & Advice
            views.setTextViewText(R.id.widget_choghadiya_badge, badgeText);
            views.setTextColor(R.id.widget_choghadiya_badge, textColor);
            views.setTextViewText(R.id.widget_choghadiya_time, choghadiyaTime);
            views.setTextViewText(R.id.widget_remaining, remainingText);
            views.setTextViewText(R.id.widget_advice, adviceText);

            // Right Card: 4 Vedic Pillars
            views.setTextViewText(R.id.widget_tithi, tithiText);
            views.setTextViewText(R.id.widget_abhijit, abhijitText);
            views.setTextViewText(R.id.widget_rahu_kaal, rahuText);
            views.setTextViewText(R.id.widget_disha, dishaText);

            // Add click intent to open main activity
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
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
    }

    @Override
    public void onDisabled(Context context) {
    }
}
