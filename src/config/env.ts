export function getGoogleClientId(): string | undefined {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  return clientId || undefined;
}

export function getRazorpayKeyId(): string | undefined {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  return keyId || undefined;
}
