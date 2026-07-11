# Implementation Plan - Integration of Inactive Engine Parameters

यह योजना निष्क्रिय पड़े खगोलीय मापदंडों (Gujarat Samvat, Solar Month, and Leap Month status) को मुख्य यूआई स्क्रीन में प्रदर्शित करने का विस्तृत विवरण है।

---

## Proposed Changes

### 1. Panchang Screen Updates

#### [MODIFY] [PanchangScreen.tsx](file:///c:/Users/user/Desktop/Samay%20Ghadi/src/components/PanchangScreen.tsx)
* **संवत् टाइमलाइन रो (Samvat Timeline Row)**:
  * वर्तमान `grid-cols-2` ग्रिड को बदलकर `grid-cols-3` (या रिस्पॉन्सिव) बनाना।
  * विक्रम संवत् और शक संवत् के ठीक बगल में **गुजरात संवत् (`samvatGujarati`)** का एक नया कार्ड जोड़ना।
* **अयन व नक्षत्र पाया कार्ड (Card 1: Ayana & Paya)**:
  * कार्ड के निचले हिस्से में `border-t` पृथक्करण रेखा के साथ **सौर मास (Solar Month)** और **अधिमास (Leap Month)** की स्थिति दर्शाने वाला सेक्शन जोड़ना।
  * अधिमास होने पर एक आकर्षक चेतावनी/संकेत बैज लगाना।

### 2. Home Tab Welcome Card Updates

#### [MODIFY] [App.tsx](file:///c:/Users/user/Desktop/Samay%20Ghadi/src/App.tsx)
* **हिन्दू मास व संवत् कार्ड**:
  * लूनर मास के नाम (`monthHindi`) के आगे अधिमास संकेत (`(अधिमास)`) जोड़ना यदि `isLeapMonth` सत्य (`true`) हो।
  * ऋतु रो (Ritu Row) के ऊपर या नीचे **सौर मास (`solarMonth`)** प्रदर्शित करने वाला एक नया रो (Row) जोड़ना।

---

## Verification Plan

### Automated Tests
* `npm run lint` चलाकर कम्पाइलेशन त्रुटियों की अनुपस्थिति जाँचना।

### Manual Verification
* होम स्क्रीन के "हिन्दू मास व संवत्" कार्ड में सौर मास और मास का अधिमास विवरण देखना।
* पंचांग स्क्रीन पर जाकर संवत् टाइमलाइन में तीनों संवत् (विक्रम, शक, गुजरात) का सही तालमेल जाँचना।
