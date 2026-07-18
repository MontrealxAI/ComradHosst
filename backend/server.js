// Falcon XL — Order backend
// Receives { name, phone, items, total } from the checkout form
// and emails it to the owner using nodemailer.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());              // allow requests from your storefront's domain
app.use(express.json());      // parse JSON bodies

const PORT = process.env.PORT || 3000;

// ---- Mail transport ----
// Uses Gmail by default. See README for setting up an "App Password".
// You can swap this for any SMTP provider (SendGrid, Mailgun, Outlook, etc.)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // the address the server sends FROM
    pass: process.env.EMAIL_PASS,   // app password, not your normal password
  },
});

// Basic sanity check that env vars are set
function checkConfig() {
  const missing = ['EMAIL_USER', 'EMAIL_PASS', 'OWNER_EMAIL'].filter(k => !process.env[k]);
  if (missing.length) {
    console.warn('⚠️  Missing required environment variables:', missing.join(', '));
    console.warn('   Orders will fail to send until these are set in your .env file.');
  }
}
checkConfig();

// ---- Simple in-memory rate limiting (per IP) to avoid spam/abuse ----
const requestLog = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a minute.' });
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  next();
}

// ---- Health check ----
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Falcon XL order backend is running.' });
});

// ---- Order endpoint ----
app.post('/api/order', rateLimit, async (req, res) => {
  try {
    const { name, phone, items, total } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, error: 'Name is required.' });
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ ok: false, error: 'Phone number is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'Cart is empty.' });
    }

    const safeName = String(name).trim().slice(0, 120);
    const safePhone = String(phone).trim().slice(0, 40);

    const itemsHtml = items.map(it =>
      `<tr>
         <td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(it.label)}</td>
         <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;">${Number(it.qty) || 0}</td>
         <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${Number(it.price) || 0} AED</td>
       </tr>`
    ).join('');

    const itemsText = items.map(it => `- ${it.label} x${it.qty} (${it.price} AED each)`).join('\n');

    const mailOptions = {
      from: `"Falcon XL Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      replyTo: undefined, // no customer email collected, so nothing to reply to directly
      subject: `New order from ${safeName} — ${total} AED`,
      text:
`New order received on Falcon XL

Name: ${safeName}
Phone: ${safePhone}

Items:
${itemsText}

Total: ${total} AED`,
      html:
`<div style="font-family:Arial,sans-serif;max-width:520px;">
  <h2 style="color:#a8842a;">New Falcon XL Order</h2>
  <p><strong>Name:</strong> ${escapeHtml(safeName)}<br>
     <strong>Phone:</strong> ${escapeHtml(safePhone)}</p>
  <table style="width:100%;border-collapse:collapse;margin-top:12px;">
    <thead>
      <tr style="background:#f5f3ee;">
        <th style="padding:6px 12px;text-align:left;">Item</th>
        <th style="padding:6px 12px;">Qty</th>
        <th style="padding:6px 12px;text-align:right;">Price</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <p style="margin-top:14px;font-size:16px;"><strong>Total: ${total} AED</strong></p>
  <p style="color:#888;font-size:12px;margin-top:24px;">Call ${escapeHtml(safePhone)} to confirm this order.</p>
</div>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ ok: true, message: 'Order sent successfully.' });
  } catch (err) {
    console.error('Failed to send order email:', err);
    res.status(500).json({ ok: false, error: 'Something went wrong sending the order. Please try again.' });
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

app.listen(PORT, () => {
  console.log(`Falcon XL backend listening on port ${PORT}`);
});
