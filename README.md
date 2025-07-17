# AI Reply Fetcher: Java Backend + Chrome Extension (EM-AI-L)

This project integrates a Java-based REST API backend with a Chrome Extension frontend to fetch and display AI-generated replies. The Java service handles the logic for sending prompts to an AI model (like OpenAI or any custom model) and returns responses via a simple API. The Chrome Extension allows users to enter prompts directly from their browser and view real-time responses powered by the backend.

It’s a full-stack integration example showcasing how a browser extension can communicate with a local or remote Java service to create an interactive AI experience.

## 🧩 Project Structure

```ai-reply-project/
├── java-backend/ # Java project (REST API to fetch AI replies)
│ ├── src/
│ └── pom.xml # or build.gradle
│
├── browser-extension/ # Chrome extension to hit the backend
│ ├── manifest.json
│ ├── content.js
│ └── popup.html
```


1️⃣ Run the Java Backend
 - cd email-writer-sb 
 - ./gradlew bootRun ( or just run directly from the springBootApplication )
The server should start at http://localhost:8080 (default)

2️⃣ Test the API
 - GET http://localhost:8080/api/email/generate

```Body
 {
     "emailContent" : "Hey how are you?",
     "tone" : "friendly"
 }
```
3️⃣ Load the Chrome Extension
 - Open Chrome and go to chrome://extensions

 - Enable Developer mode (top right)

 - Click Load Unpacked

 - Select the browser-extension/ folder

 - Extension will appear in your toolbar


4️⃣ Use the Extension
 - When you click on the 'AI-Reply' button generated while replying to an email, the email- content will be filled with the AI generated reply based on the email content received.
