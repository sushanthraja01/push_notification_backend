const express = require("express");
const webpush = require("web-push");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// VAPID keys
const publicVapidKey = "BFRoQ6-5WAEkEDFi2MrzBvdmL9TqMVzNzD1-4GbG-mt6omFQjS-9P-4QLSKFAtrLgCwNoNdLvH9th1O8_jlOYSo";
const privateVapidKey = "-WZJJoJLINMWtzHjJnBOikzYUlYJd-7VcT4oti6TaoY";

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];

// Subscribe API
app.post("/subscribe", (req, res) => {

  console.log("Cme for sub")

  const subscription = req.body;

  const exists = subscriptions.find(
    sub => sub.endpoint === subscription.endpoint
  );

  if (!exists) {
    subscriptions.push(subscription);
  }

  console.log("Total subscriptions:", subscriptions.length);

  res.status(201).json({ message: "Subscribed successfully" });

});

// Send notification
app.post("/sendNotification", async (req, res) => {

  const payload = JSON.stringify({
    title: "New Notification",
    body: "Hello from MERN push notification!"
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {

        console.log("Sending notification to:", sub.endpoint);

        await webpush.sendNotification(sub, payload);

      } catch (err) {

        console.error("Push error:", err.statusCode);

      }
    })
  );

  res.json({
    message: "Notification sent",
    totalSubscribers: subscriptions.length
  });

});

// Health check
app.get("/", (req, res) => {
  console.log("working");
  res.send("Working");
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});