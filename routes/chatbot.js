// const express = require('express');
// const router = express.Router();

// router.post('/bargain', (req, res) => {
//   const { message, hotelId, hotelPrice } = req.body;

//   const price = Number(hotelPrice);

//   if (/price|cost|how much|availability/i.test(message)) {
//     const discount = price * 0.10;
//     const discountedPrice = price - discount;

//     const reply = `The price for this hotel is ₹${price.toLocaleString("en-IN")}. But I can offer you a special 10% discount! So, the discounted price is ₹${discountedPrice.toLocaleString("en-IN")}. Would you like to book now?`;

//     return res.json({ reply });
//   }

//   const fallbackReply = "Sorry, I can only help with price and availability questions right now.";
//   return res.json({ reply: fallbackReply });
// });

// module.exports = router;
const express = require('express');
const router = express.Router();

let stage = {}; // to keep chat state per session/user (optional)

router.post('/bargain', (req, res) => {
  const { message, hotelId, hotelPrice } = req.body;
  const msg = message.toLowerCase();
  const price = Number(hotelPrice);
  const tenPercentDiscount = price * 0.10;
  const discountedPrice = price - tenPercentDiscount;

  let reply = "Sorry, I can only help with price and discount-related queries.";

  // Greeting and intro
  if (/hi|hello|hey|good (morning|evening|afternoon)/i.test(msg)) {
    reply = "Hi there! 👋 I’m here to help you with hotel price and discounts only. If you're interested, just reply with 'price' or 'discount' to begin.";
    return res.json({ reply });
  }

  // Begin price interaction
  if (/price|discount|cost|rate/i.test(msg)) {
    stage[hotelId] = 'awaiting_budget';
    reply = `The listed price for this hotel is ₹${price.toLocaleString("en-IN")}. I can offer you a **10% discount**, making it ₹${discountedPrice.toLocaleString("en-IN")}.\n\n💬 What's your budget?`;
    return res.json({ reply });
  }

  // Handle numeric budget input
  if (!isNaN(msg) && stage[hotelId] === 'awaiting_budget') {
    const budget = parseInt(msg);

    // Acceptable budget (within 10% discount)
    if (budget >= discountedPrice) {
      stage[hotelId] = 'deal_done';
      reply = `Great! 🎉 I can offer the hotel at ₹${budget.toLocaleString("en-IN")}. You can book now within the next 10 minutes. I’ll inform the hotel and update the bill to reflect this discount. ✅\n\n📩 Here's your bill:\n**Hotel Price: ₹${price.toLocaleString("en-IN")}**\n**Discounted Price: ₹${budget.toLocaleString("en-IN")}**`;
    }
    // Too low budget → counter offer
    else {
      stage[hotelId] = 'awaiting_accept';
      reply = `Hmm, ₹${budget.toLocaleString("en-IN")} is a bit low. 😅 But I really want to help you! I can offer a special deal of **₹${discountedPrice.toLocaleString("en-IN")}**. Do you accept? (yes/no)`;
    }
    return res.json({ reply });
  }

  // Handle acceptance of counter-offer
  if (/yes|sure|okay|ok/i.test(msg) && stage[hotelId] === 'awaiting_accept') {
    stage[hotelId] = 'deal_done';
    reply = `Awesome! 🎉 I've locked the price at ₹${discountedPrice.toLocaleString("en-IN")} for you.\n\nPlease book it within the next 10 minutes. The final bill will reflect this discount:\n📩 **Hotel Price: ₹${price.toLocaleString("en-IN")}**\n💰 **Discounted Price: ₹${discountedPrice.toLocaleString("en-IN")}**`;
    return res.json({ reply });
  }

  // Handle negative response
  if (/no|not now|later/i.test(msg)) {
    stage[hotelId] = null;
    reply = "No problem! Let me know if you want to continue later. I’m always here to help. 😊";
    return res.json({ reply });
  }

  res.json({ reply });
});
module.exports=router;
