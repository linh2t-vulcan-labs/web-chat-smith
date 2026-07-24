import type { TQuestionCategoryRaw } from "./types";

export const FAQ_DATA_EN: TQuestionCategoryRaw[] = [
  {
    category: "Features",
    description: "Discover what the app can do.",
    icon: "/icons/feature.svg",
    id: 1,
    questions: [
      {
        answer: `1. **Delete messages/conversations created with the Chat feature:**
  - In the **History** tab, hover on the conversation and select "Remove" to delete a single conversation.
  - To delete a single message in the conversation: *not yet available*.
  
  2. **Delete messages/conversations created with the Assistant feature:**
  - In the **Assistant** tab, hover on the topic and select "Remove" to delete a single conversation.
  - Multi-topic delete: *not yet available*.`,
        id: 1,
        question: "How to delete messages?",
        shortAnswer: `1. **Delete messages/conversations created with the Chat feature:**
  - In the **History** tab, hover on the conversation and select "Remove" to delete a single conversation.
  - To delete a single message in the conversation: *not yet available*.
  
  2. **Delete messages/conversations created with the Assistant feature:**`,
      },
      {
        answer: `Unfortunately, we don't have that automatic function. This feature may collect your data and require space on our server for storage. We recommend you request the chatbot to include your name each time for specific purposes.`,
        id: 2,
        question: "How to apply my name in response of Chatbot?",
      },
      {
        answer: `Not yet available on web version.`,
        id: 3,
        question: "How to change theme or background?",
      },
      {
        answer: `Not yet available on web version.`,
        id: 4,
        question: "How to use the Image input feature and Voice Assistant?",
      },
      {
        answer: `In the Chat feature, the maximum word limit for each input differs based on the model and is displayed on the UI for Premium users.`,
        id: 5,
        question: "What is the word limit of each question?",
      },
    ],
  },
  {
    category: "Quick Fix",
    description: "Quick solutions for common problems.",
    icon: "/icons/quick-fix.svg",
    id: 2,
    questions: [
      {
        answer: `To ensure a consistent conversation flow, we strongly recommend using **GPT-3.5** for the time being. Please rest assured that we are continually working to improve and will soon add this feature for **GPT-4** in the next version.
  
  ---
  
  ### More comparison of two models GPT:  
  
  #### **GPT-3.5**
  - **Description**: High-speed language model for fast, top-quality conversational experiences.  
  - **Reasoning**: High  
  - **Speed**: High  
  - **Conciseness**: High  
  
  #### **GPT-4**
  - **Description**: Enhanced reasoning, concise responses, albeit slower, for enriched conversational interactions.  
  - **Reasoning**: Higher  
  - **Speed**: Moderate  
  - **Conciseness**: Higher  
  
  ---
  
  **Note**: This model may occasionally generate inaccurate, harmful, or biased information and has limited knowledge of events and developments beyond 2021.
  `,
        id: 1,
        question: "Why cannot the Chatbot remember previous chats?",
        shortAnswer: `To ensure a consistent conversation flow, we strongly recommend using **GPT-3.5** for the time being. Please rest assured that we are continually working to improve and will soon add this feature for **GPT-4** in the next version.
  ### More comparison of two models GPT:  
  
  #### **GPT-3.5**
  - **Description**: High-speed language model for fast, top-quality conversational experiences. `,
      },
      {
        answer: `If you face this issue, please reload the website or wait for a few minutes and come back later.`,
        id: 2,
        question: "Why bot response capacity or something went wrong?",
      },
      {
        answer: `AI collects information from various sources, including unverified or outdated ones. OpenAI is constantly improving the chatbot's accuracy, so update the app regularly and be selective with answers for the best experience.  
  
  The GPT-3.5 model is set to have its data updated up until September 2021. On the other hand, the GPT-4 model will receive data updates until April 2023. However, the latter is only available to premium users.
          `,
        id: 3,
        question: "Why is the information incorrect or outdated sometimes?",
      },
      {
        answer: `The current version of the website is available for **Premium users**. Please log in on the mobile app, create an account (for the app to link the premium with your account), then come back to the website to enjoy the web version.`,
        id: 4,
        question: "Why I cannot access on Website/Laptop/PC?",
      },
    ],
  },
  {
    category: "Premium Perks",
    description: "See what premium membership offers.",
    icon: "/icons/premium.svg",
    id: 3,
    questions: [
      {
        answer: `- Unlimited access to **GPT-4** or the latest models (if available).
  - Increased word limit up to **16100 characters** for typing messages in chat tabs in the web version.
  - An unlimited number of dialogues and messages.
  - **No Ads**.`,
        id: 1,
        question: "What we offer you as a Premium member?",
      },
      {
        answer: `Yes, the **GPT-4** (or the latest model - if available) and other future updates will be enabled on our side. You do not need to take any action or pay any additional fee.`,
        id: 2,
        question:
          "Does the Lifetime fee include future updates of the chat models?",
      },
      {
        answer:
          "When you change your subscription package, the new package takes effect immediately. This means you'll instantly gain access to the benefits of your new package, but any remaining benefits from your previous package will no longer be available.",
        id: 3,
        question: "What happens when I change my subscription package?",
      },
      {
        answer:
          "No, when you switch to a new package, your previous package is immediately cancelled and replaced by the new one, even if it hasn't expired yet. We do this to ensure you can start enjoying your new benefits right away.",
        id: 4,
        question:
          "Will I still have access to my old package benefits if I switch before it expires?",
      },
    ],
  },
  {
    category: "About App",
    description: "Learn about the app and its purpose.",
    icon: "/icons/about.svg",
    id: 4,
    questions: [
      {
        answer: `Yes, our app is affiliated with Open AI at the **Enterprise Partner** level. However, subscriptions to our app are separate from those with the Open AI website (ChatGPT Plus).`,
        id: 1,
        question: "Is your app affiliated with Open AI?",
      },
      {
        answer: `The chat models used by our app are **GPT-4** and **Chat GPT-3.5**. You can switch between the **Chat GPT-3.5** and **GPT-4** models depending on your purposes.`,
        id: 2,
        question: "What are the chat models used by the app?",
      },
    ],
  },
  {
    category: "Billing",
    description: "Help with payments and invoices.",
    icon: "/icons/bill.svg",
    id: 5,
    questions: [
      {
        answer: `Please help to proceed on the original purchase platform/device.  
  **Please note the following:**  
  
  - Uninstalling the app will **not cancel your subscription** or stop any charges.  
  - For subscriptions: Both **cancellation** and **refund requests** are required.  
  - For a Lifetime purchase: Only a **refund request** is required.  
  
  ---
  
  ### How to Cancel a Subscription and Request a Refund  
  
  #### **On Android**  
  - **Cancel**: [Google Play Support – Cancel a Subscription](https://support.google.com/googleplay/answer/7018481)  
  - **Refund**: [Google Play Support – Request a Refund](https://support.google.com/googleplay/answer/2479637)  
  
  #### **On iOS**  
  - **Cancel**: [Apple Support – Cancel a Subscription](https://support.apple.com/en-us/118428)  
  - **Refund**: [Apple Support – Request a Refund](https://support.apple.com/en-us/118223)  
  
  ---
  
  ### Additional Information  
  
  - **Subscription and Lifetime packages** are processed **separately** and do not affect or depend on each other.  
  - Subscriptions will be **automatically renewed** unless canceled **at least 24 hours before** their expiration time.  
  - The Lifetime package is an **in-app product** (not a subscription) and will **not appear in the Subscription menu**.
  `,
        id: 1,
        question: "Cancel/stop a subscription and request a refund",
        shortAnswer: `Please help to proceed on the original purchase platform/device.  
  **Please note the following:**  
  
  - Uninstalling the app will **not cancel your subscription** or stop any charges.  
  - For subscriptions: Both **cancellation** and **refund requests** are required.`,
      },
      {
        answer: `Please help to proceed on the original purchase platform/device.  
  **Please note the following:**  
  
  All payments are obligatory through the **Google Play Store** (for Android devices) or the **App Store** (for iOS devices).  
  For more details, please read the following articles to find out the accepted payment methods in your country:  
  
  ---
  
  ### **On Android**  
  - **Accepted payment methods on Google Play**: [Learn More](https://support.google.com/googleplay/answer/2651410)  
  - **How to add, remove, or edit your Google Play payment method**: [Learn More](https://support.google.com/googleplay/answer/4646404)  
  
  ---
  
  ### **On iOS**  
  - **Accepted payment methods on the App Store**: [Learn More](https://support.apple.com/en-us/HT202631)  
  - **How to add a payment method to your Apple ID**: [Learn More](https://support.apple.com/en-us/HT202631)  
  `,
        id: 2,
        question:
          "Accepted payment methods and how to add or change your cards",
        shortAnswer: `Please help to proceed on the original purchase platform/device.  
  **Please note the following:**  
  
  All payments are obligatory through the **Google Play Store** (for Android devices) or the **App Store** (for iOS devices).  
  For more details, please read the following articles to find out the accepted payment methods in your country:`,
      },
      {
        answer: `### **On iOS**  
  When you purchase the app, Apple will send you an invoice/receipt via your email. You can also access invoices for any past purchases made on the iOS or Mac App Store from Apple’s [Report a Problem](https://reportaproblem.apple.com) website.
  
  1. Open the website and log in with the **Apple ID** used to make the purchase.  
  2. The **Report a Problem** website allows you to:  
     - Fetch invoices for any services from Apple that you are subscribed to.  
     - Click "View Receipt" to access a proper receipt with all the information you need for tax purposes.  
  
  ---
  
  ### **On Android**  
  The address shown on your VAT invoice or receipt is your **legal address at the time of purchase**.  
  **Note**: You cannot change the address on a VAT invoice or receipt after the purchase has been made.  
  
  To retrieve a VAT invoice or receipt:  
  1. Sign in to: [Google Pay Settings](https://pay.google.com/#settings)  
  2. Check that you've entered your **tax ID number**. If you haven't, enter it now.  
     - In some countries, you cannot get a VAT invoice or receipt if the tax ID number was not entered **before the purchase**.  
  3. Click **Activity** to view your purchase history and invoices.  
  `,
        id: 3,
        question: "How to get VAT/tax invoice (receipt)",
        shortAnswer: `### **On iOS**  
  When you purchase the app, Apple will send you an invoice/receipt via your email. You can also access invoices for any past purchases made on the iOS or Mac App Store from Apple’s [Report a Problem](https://reportaproblem.apple.com) website.
  
  1. Open the website and log in with the **Apple ID** used to make the purchase.  
  2. The **Report a Problem** website allows you to:`,
      },
      {
        answer:
          "The new package price will be charged immediately when you make the change. This starts your new payment cycle from the date of your package change.",
        id: 4,
        question:
          "When will I be charged if I purchase a new subscription package?",
      },
      {
        answer: `Unfortunately, we don't offer refunds for unused time on previous packages when you switch to a new one. The new package and its pricing take effect immediately upon change.`,
        id: 5,
        question: "What happens to the payment I made for my previous package?",
      },
      {
        answer:
          "Yes, your billing date will reset to the day you switch packages. This new date will become your regular billing date for future payments.",
        id: 6,
        question: "Will my billing date change when I switch packages?",
      },
      {
        answer:
          "We don't provide credit for unused time on previous packages. The new package price is charged in full, starting a fresh billing cycle.",
        id: 7,
        question:
          "If I upgrade to a more expensive package, will I get credit for my unused time on the cheaper package?",
      },
    ],
  },
  {
    category: "Account",
    description: "Manage your account settings.",
    icon: "/icons/account.svg",
    id: 6,
    questions: [
      {
        answer: `You may be wondering why you are being charged for a subscription renewal, even if you have purchased another plan or a Lifetime subscription. Or you might want to apply the remaining time of your current subscription towards another plan or Lifetime subscription.
  
  ---
  
  ### **Beforehand, please consider the following points from our subscription policy:**  
  1. **Subscription and Lifetime packages** are **separate** and do not affect each other.  
  2. **Different subscription plans** are also **separate** and do not affect each other.  
  3. Subscriptions will be **automatically renewed** unless canceled **at least 24 hours before** their expiration time.  
  
  ---
  
  ### **Here is our suggestion for your case:**  
  1. **Cancel your current subscription** to avoid auto-renewal (do this at least 24 hours before the due time).  
  2. **Request a refund** for any unexpected charges (please do this immediately).  
  3. **Purchase or keep only the desired plan** to avoid future confusion.  
  
  ---
  
  ### **Read more**:  
  [Cancel/Stop a Subscription and Request a Refund](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)
  `,
        id: 1,
        question: "Change plans / Auto-renewal when already bought Lifetime",
        shortAnswer: `You may be wondering why you are being charged for a subscription renewal, even if you have purchased another plan or a Lifetime subscription. Or you might want to apply the remaining time of your current subscription towards another plan or Lifetime subscription.
  ### **Beforehand, please consider the following points from our subscription policy:**  
  1. **Subscription and Lifetime packages** are **separate** and do not affect each other.  
  2. **Different subscription plans** are also **separate** and do not affect each other.  `,
      },
      {
        answer: `  
  #### **(1) What are the differences between subscriptions and Lifetime plans?**  
  There are two types of purchases:  
  - **Subscriptions** (Weekly, Monthly, Yearly):  
    - Provide full access to Premium for a set time.  
    - Are **automatically renewed** after the due time unless canceled.  
  
  - **Lifetime package**:  
    - Provides full access to Premium **forever**.  
    - Requires a **one-time payment** and is not a subscription.  
  
  ---
  
  #### **(2) Why are there similar subscription plans in the Subscriptions menu?**  
  - The prices on the **Manage Subscription** screen are for **testing purposes** and may not apply to your specific case.  
  - Accurate prices are displayed **in the app** before you make a purchase (in-app purchase).  
  - The **Lifetime plan** is an **in-app product**, not a subscription. Therefore, it will not be displayed in the **Manage Subscription** menu.  
  
  ---
  
  #### **(3) Where can I find my purchase?**  
  If you have purchased a subscription or a Lifetime package, here’s where to check your details:  
  
  **On iOS**:  
  - For subscriptions:  
    1. Go to **Settings** on your phone.  
    2. Tap **Apple ID** > **Subscriptions**.  
  
  - For Lifetime package:  
    1. Open the app.  
    2. Go to **Settings** > **Store**.  
  
  **On Android**:  
  - For subscriptions:  
    1. Open the **Google Play** app.  
    2. Tap the **profile icon** > **Payments & subscriptions** > **Subscriptions**.  
  
  - For Lifetime package:  
    1. Open the app.  
    2. Go to **Settings** > **Store**.  
  `,
        id: 2,
        question: "FAQ about Subscriptions, Lifetime Plans, and Purchases",
        shortAnswer: `  
  #### **(1) What are the differences between subscriptions and Lifetime plans?**  
  There are two types of purchases:  
  - **Subscriptions** (Weekly, Monthly, Yearly):  
    - Provide full access to Premium for a set time.`,
      },
      {
        answer: `We are offering create account by facebook, google and apple account. If you want to update or change any info, visit these providers to update/ change info and use these info to login the app, website for further usage.`,
        id: 3,
        question: "Find my username and password to login the app",
      },
      {
        answer: `### **FAQs: Troubleshooting Premium Access Issues**  
  
  Many reasons could prevent the app from activating your Premium access after a long time or when you change devices. Kindly follow these steps (in order) to resolve the issue:  
  
  ---
  
  1. **Ensure you are signed in with the correct email:**  
     - During all troubleshooting, make sure you sign in to the **Google Play Store** or **App Store** ONLY with the registered email (used to purchase the app). This will help the app recognize your Premium access.  
  
  2. **Check your Internet connection:**  
     - Ensure that your Internet network is **stable** to smoothly connect to the Google or Apple systems.  
  
  3. **Reinstall the app:**  
     - Uninstall the app, restart your phone, and install it again. Then, check if the issue is resolved.  
  
  4. **Clear the cache (for Android):**  
     - If the issue persists on Android, try clearing the cache of the Google Play Store app:  
       - Open the **Settings** app on your device.  
       - Navigate to the **App Menu**.  
       - Choose **Installed Apps** and find the **Google Play Store** app.  
       - Move to the **Storage Tab** and select **Clear Storage** or **Clear App Data**.  
       - Restart your phone and open the app again.  
  
  ---
  
  Following these steps should resolve most issues related to Premium access. If the problem persists, please contact customer support for further assistance.  
  `,
        id: 4,
        question: "Still ads and being asked for buying when already purchased",
        shortAnswer: `### **FAQs: Troubleshooting Premium Access Issues**  
  Many reasons could prevent the app from activating your Premium access after a long time or when you change devices. Kindly follow these steps (in order) to resolve the issue:  
  1. **Ensure you are signed in with the correct email:**`,
      },
      {
        answer: `### **FAQs: Free Trial and Premium Plans**  
  
  #### **Important Information About Free Trials**  
  - Once you purchase any of the Premium plans in the app, you **cannot use the free trial again**.  
  - If you try to subscribe to the free trial again, you will be **charged immediately**.  
  
  #### **Have You Subscribed to the Trial or Premium Plans Before?**  
  If you're unsure about previous subscriptions or are confused about charges during the trial period, consider the following:  
  
  1. **Charging for the First Trial:**  
     - Don’t worry! This transaction is just to **authorize your card**.  
     - The amount will be treated as a **deposit** for your purchase once you complete the trial period.  
     - If you cancel the trial on time, the amount will be refunded to you.  
  
  2. **Determining Whether It’s Your First or Second Trial:**  
     - Simply check the purchase screen.  
       - **First-time trial:** Displays a starting date (e.g., "starting on a specific date").  
       - **Second-time trial:** Displays "starting today" and will be charged immediately.  
  
  ---
  
  ### **Need a Refund?**  
  If you're considering a refund, please refer to this guide for detailed instructions:  
  [Cancel/Stop a Subscription and Request a Refund](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)
  
  ---
  
  ### **Related Article:**  
  [Still Seeing Ads or Being Asked to Purchase After Already Purchasing?](/faq/account/still-ads-and-being-asked-for-buying-when-already-purchased)  
  `,
        id: 5,
        question:
          "I signed up for the free trial but I was charged immediately. Why?",
        shortAnswer: `### **FAQs: Free Trial and Premium Plans**  
  
  #### **Important Information About Free Trials**  
  - Once you purchase any of the Premium plans in the app, you **cannot use the free trial again**.  
  - If you try to subscribe to the free trial again, you will be **charged immediately**.`,
      },
      {
        answer: `### **Accidental Double Purchase of Premium Upgrade**  
  
  If you have accidentally purchased the **Premium upgrade** twice, please use the link below to request a refund:  
  [Cancel/Stop a Subscription and Request a Refund](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)  
  
  #### **Important Information:**  
  - Normally, it is **impossible to purchase the same subscription twice** using the same Apple ID for the same subscription option at the same time or before the expiration of the current subscription.  
  - If you have been charged twice for the same subscription, please provide the **receipts** of both transactions. Ensure the receipts include:  
    - **App name**  
    - **Date of purchase**  
    - **Subscription plan**  
  
  Once we receive and verify the receipts, we will process your refund request.  
  
  ---
  
  ### **Contact Us:**  
  For further assistance, please reach out to us via email:  
  [Email Support](mailto:support@vulcanlabs.co)  
  `,
        id: 6,
        question: "Why was I charged twice for the app?",
        shortAnswer: `### **Accidental Double Purchase of Premium Upgrade**  
  
  If you have accidentally purchased the **Premium upgrade** twice, please use the link below to request a refund:  
  [Cancel/Stop a Subscription and Request a Refund](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)  
  
  #### **Important Information:**`,
      },
    ],
  },
  {
    category: "Common issues",
    description: "Troubleshoot common issues.",
    icon: "/icons/issue.svg",
    id: 7,
    questions: [
      {
        answer: `Absolutely yes. Our product is available for free users on the mobile app, but there are certain limitations. Free users can only use our product for a limited time and will see both banner and interstitial ads. On the other hand, subscribed users can enjoy an ad-free experience without any limits.
  
  We encourage you to try our Premium Service by subscribing to our free trial offer, which lasts for 3-7 days (depending on the app). After that, you will be charged for the subscription. You can cancel the subscription at any time, but please make sure to do it at least 24 hours before the free trial period ends.
  
  ### Related article:
  - [Cancel/stop a subscription and request a refund](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)
  - [Change plans / Auto-renewal when already bought Lifetime](/faq/account/change-plans-auto-renewal-when-already-bought-lifetime)
  
  `,
        id: 1,
        question: "Can I use your apps for free?",
      },
      {
        answer: `Our app only supports **English**, so users cannot change the language. If you need assistance, please don’t hesitate to contact our customer service team in your preferred language. We will do our best to assist you.`,
        id: 2,
        question: "Change the language of the app",
      },
      {
        answer: `Our app does not support the Family Sharing feature. However, your family members can still use this Premium service if they sign in with the same Apple ID (with iOS device) or Google Account (with Android devices) that was used to buy the app.
  It is impossible to switch Premium accounts between iOS and Android (because of two different mechanisms).`,
        id: 3,
        question: "Does your app support Family Sharing?",
      },
      {
        answer: `To get in touch with our customer support team, you have two options:
  1. **Email**: Contact us via email at **support@vulcanlabs.co** and describe your issue.
  2. **Live Chat**: Reach us through the live chat channel in the mobile app.
  Please note that we do not support phone calls at the moment.`,
        id: 4,
        question: "How can I get help from your team?",
      },
    ],
  },
];
