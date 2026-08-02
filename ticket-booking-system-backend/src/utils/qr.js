const fs = require("fs").promises;
const path = require("path");
const QRCode = require("qrcode");

const qrDirectory = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "qrcodes"
);

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5000";

const makeQrFileName = (bookingReference) =>
  `${bookingReference}.png`;

const makeQrFilePath = (bookingReference) =>
  path.join(qrDirectory, makeQrFileName(bookingReference));

const makeQrUrl = (bookingReference) =>
  `/qrcodes/${makeQrFileName(bookingReference)}`;

const makeVerificationUrl = (bookingReference) =>
  `${appBaseUrl}/api/v1/bookings/verify/${bookingReference}`;

const ensureQrDirectory = async () => {
  await fs.mkdir(qrDirectory, { recursive: true });
};

const generateQrTicket = async (booking) => {
  await ensureQrDirectory();

  const payload = makeVerificationUrl(booking.bookingReference);
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 400,
    margin: 2
  });

  const base64 = dataUrl.split(",")[1];
  const filePath = makeQrFilePath(booking.bookingReference);
  const buffer = Buffer.from(base64, "base64");

  await fs.writeFile(filePath, buffer);

  return {
    qrCodeUrl: makeQrUrl(booking.bookingReference),
    qrCodeBase64: dataUrl
  };
};

const qrTicketExists = async (bookingReference) => {
  try {
    await fs.access(makeQrFilePath(bookingReference));
    return true;
  } catch {
    return false;
  }
};

const ensureQrTicket = async (booking) => {
  if (!(await qrTicketExists(booking.bookingReference))) {
    await generateQrTicket(booking);
  }

  return {
    qrCodeUrl: makeQrUrl(booking.bookingReference)
  };
};

module.exports = {
  generateQrTicket,
  ensureQrTicket,
  makeQrUrl,
  makeVerificationUrl
};
