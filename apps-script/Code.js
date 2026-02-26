function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Honeypot check — if filled, it's a bot
    if (data.website) {
      output.setContent(JSON.stringify({
        result: 'error',
        message: 'Bot detected'
      }));
      return output;
    }

    // Map interests to individual boolean columns
    var interests = data.interests || [];
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email,
      interests.indexOf('brainfit') > -1,
      interests.indexOf('unison') > -1,
      interests.indexOf('meelo') > -1,
      interests.indexOf('newsletter') > -1,
      interests.indexOf('podcast') > -1,
      data.source || '98chimp.ca'
    ]);

    // Internal notification
    sendNotification(data.name, data.email, interests);

    // User confirmation
    sendConfirmation(data.name, data.email, interests);

    output.setContent(JSON.stringify({
      result: 'success',
      message: 'Signup recorded'
    }));
    return output;

  } catch (error) {
    output.setContent(JSON.stringify({
      result: 'error',
      message: error.toString()
    }));
    return output;
  }
}

function doGet(e) {
  return ContentService.createTextOutput('98%Chimp Signup API is running.');
}

// ── Internal notification ──────────────────────────
function sendNotification(name, email, interests) {
  var subject = 'New 98%Chimp signup: ' + (name || email);
  var body = 'New signup on 98chimp.ca\n\n'
    + 'Name: ' + (name || '(not provided)') + '\n'
    + 'Email: ' + email + '\n'
    + 'Interests: ' + (interests.length ? interests.join(', ') : 'none selected') + '\n\n'
    + 'View all signups: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

  GmailApp.sendEmail('hello@98chimp.com', subject, body, {
    from: 'hello@98chimp.com',
    name: '98%Chimp'
  });
}

// ── User confirmation ──────────────────────────────
function sendConfirmation(name, email, interests) {
  var greeting = name ? ('Hi ' + name + '!') : 'Hi there!';
  var interestList = interests.length
    ? interests.map(function(i) { return '✦ ' + capitalize(i); }).join('\n')
    : '✦ General updates';

  var subject = "You're in — welcome to 98%Chimp";

  var htmlBody = '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background:#F5F1EB;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F1EB;">'
    + '<tr><td align="center" style="padding:40px 20px;">'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;background:#ffffff;border-radius:20px;border:1px solid rgba(0,0,0,0.06);">'

    // Header
    + '<tr><td style="padding:40px 40px 24px;text-align:center;">'
    + '<span style="color:#FF4600;font-size:28px;font-weight:700;">98%Chimp</span>'
    + '</td></tr>'

    // Greeting
    + '<tr><td style="padding:0 40px;">'
    + '<h1 style="color:#1a1a1a;font-size:24px;font-weight:600;margin:0 0 16px;">' + greeting + '</h1>'
    + '<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 24px;">'
    + 'Thanks for your curiosity. We\'ll only reach out when it matters.</p>'
    + '</td></tr>'

    // Interests box
    + '<tr><td style="padding:0 40px;">'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">'
    + '<tr><td style="background:rgba(255,70,0,0.06);border:1px solid rgba(255,70,0,0.15);border-radius:12px;padding:20px;">'
    + '<p style="color:#1a1a1a;font-size:14px;font-weight:600;margin:0 0 8px;">You signed up for:</p>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0;white-space:pre-line;">' + interestList + '</p>'
    + '</td></tr></table>'
    + '</td></tr>'

    // Sign-off
    + '<tr><td style="padding:24px 40px 40px;">'
    + '<p style="color:#555;font-size:14px;line-height:1.6;margin:0;">Questions? Just reply to this email.</p>'
    + '</td></tr>'

    // Footer
    + '<tr><td style="padding:20px 40px;border-top:1px solid rgba(0,0,0,0.06);text-align:center;">'
    + '<p style="color:#999;font-size:12px;margin:0;">© ' + new Date().getFullYear() + ' 98% Chimp Inc.</p>'
    + '<a href="https://www.98chimp.ca" style="color:#FF4600;font-size:12px;text-decoration:none;">www.98chimp.ca</a>'
    + '</td></tr>'

    + '</table></td></tr></table></body></html>';

  var plainBody = greeting + '\n\n'
    + 'Thanks for your curiosity. We\'ll only reach out when it matters.\n\n'
    + 'You signed up for:\n' + interestList + '\n\n'
    + 'Questions? Just reply to this email.\n\n'
    + '— The 98%Chimp Team\n'
    + 'www.98chimp.ca';

  GmailApp.sendEmail(email, subject, plainBody, {
    htmlBody: htmlBody,
    from: 'hello@98chimp.com',
    name: '98%Chimp'
  });
}

// ── Helpers ────────────────────────────────────────
function capitalize(str) {
  if (str === 'brainfit') return 'BrainFit';
  if (str === 'unison') return 'Unison';
  if (str === 'meelo') return 'Meelo';
  if (str === 'newsletter') return 'Newsletter';
  if (str === 'podcast') return 'The Falcon & The Whale';
  return str;
}

// ── Test function ──────────────────────────────────
function testConfirmation() {
  sendConfirmation('Test User', 'shahinz@mac.com', ['brainfit', 'podcast']);
}
