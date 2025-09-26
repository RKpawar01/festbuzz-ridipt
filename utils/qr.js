const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");

/**
 * Create a signed token embedding booking info, and render as PNG buffer.
 * payload: { type: 'fest'|'event', bookingId: string, participantId: string }
 */
async function generateQrPngBuffer(payload) {
  const token = jwt.sign(payload, process.env.QR_SECRET || process.env.JWT_SECRET, {
    expiresIn: "14d"
  });
  const data = JSON.stringify({ v: 1, t: token });
  return await QRCode.toBuffer(data, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });
}

module.exports = { generateQrPngBuffer };


