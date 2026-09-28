import { sendTransactionalEmail } from "../src/services/emailService";

const recipient = process.env.TEST_EMAIL_TO;
if (!recipient) throw new Error("Set TEST_EMAIL_TO to the sandbox recipient.");

const result = await sendTransactionalEmail({
  to: recipient,
  subject: "TalentBridge Week 4 sandbox test",
  html: "<h1>TalentBridge email integration works</h1><p>This is a real sandbox integration test.</p>",
  idempotencyKey: "week4-sandbox-test-v1"
});
console.info(result);
