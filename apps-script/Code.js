function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot check — if filled, it's a bot
    if (data.website) {
      output.setContent(JSON.stringify({
        result: 'error',
        message: 'Bot detected'
      }));
      return output;
    }

    // Route by source
    var source = data.source || '98chimp.ca';

    if (source === 'DKDerby') {
      handleDKDerby(data);
    } else {
      handle98Chimp(data);
    }

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

// ══════════════════════════════════════════════════════
// 98%Chimp (parent site)
// ══════════════════════════════════════════════════════

function handle98Chimp(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('98%Chimp');
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

  send98ChimpNotification(data.name, data.email, interests);
  send98ChimpConfirmation(data.name, data.email, interests);
}

function send98ChimpNotification(name, email, interests) {
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

function send98ChimpConfirmation(name, email, interests) {
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
    + '<p style="color:#999;font-size:12px;margin:0;">\u00A9 ' + new Date().getFullYear() + ' 98% Chimp Inc.</p>'
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

// ══════════════════════════════════════════════════════
// DK Derby
// ══════════════════════════════════════════════════════

function handleDKDerby(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DK Derby');

  sheet.appendRow([
    new Date(),
    data.firstName || '',
    data.email,
    data.joiningAs || '',
    data.source || 'DKDerby'
  ]);

  sendDKDerbyNotification(data.firstName, data.email, data.joiningAs);
  sendDKDerbyConfirmation(data.firstName, data.email, data.joiningAs);
}

function sendDKDerbyNotification(name, email, joiningAs) {
  var subject = 'New DK Derby signup: ' + (name || email);
  var body = 'New early access signup on DK Derby\n\n'
    + 'Name: ' + (name || '(not provided)') + '\n'
    + 'Email: ' + email + '\n'
    + 'Joining as: ' + (joiningAs || 'not specified') + '\n\n'
    + 'View all signups: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

  GmailApp.sendEmail('hello@98chimp.com', subject, body, {
    from: 'hello@98chimp.com',
    name: 'DK Derby'
  });
}

function sendDKDerbyConfirmation(name, email, joiningAs) {
  var greeting = name ? ('Hi ' + name + '!') : 'Hi there!';
  var joiningLabel = joiningAs || 'Early access';

  var subject = "You're on the list — DK Derby";

  var htmlBody = '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background:#F5F1EB;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F1EB;">'
    + '<tr><td align="center" style="padding:40px 20px;">'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;background:#ffffff;border-radius:20px;border:1px solid rgba(0,0,0,0.06);">'

    // Header
    + '<tr><td style="padding:40px 40px 24px;text-align:center;">'
    + '<span style="color:#E67E22;font-size:28px;font-weight:700;">DK Derby</span>'
    + '</td></tr>'

    // Greeting
    + '<tr><td style="padding:0 40px;">'
    + '<h1 style="color:#1a1a1a;font-size:24px;font-weight:600;margin:0 0 16px;">' + greeting + '</h1>'
    + '<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 24px;">'
    + 'You\'re on the early access list for Dunning-Kruger Derby. '
    + 'We\'ll notify you the moment it\'s ready. Prepare to be humbled.</p>'
    + '</td></tr>'

    // Joining-as box
    + '<tr><td style="padding:0 40px;">'
    + '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">'
    + '<tr><td style="background:rgba(230,126,34,0.08);border:1px solid rgba(230,126,34,0.2);border-radius:12px;padding:20px;">'
    + '<p style="color:#1a1a1a;font-size:14px;font-weight:600;margin:0 0 8px;">You signed up as:</p>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0;">&#10022; ' + joiningLabel + '</p>'
    + '</td></tr></table>'
    + '</td></tr>'

    // TestFlight CTA
    + '<tr><td style="padding:24px 40px 0;">'
    + '<h2 style="color:#1a1a1a;font-size:18px;font-weight:600;margin:0 0 12px;">Get the beta</h2>'
    + '<p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 20px;">'
    + 'DK Derby is available now on TestFlight. Tap the button below to join the beta '
    + '(you\'ll need <a href="https://apps.apple.com/app/testflight/id899247664" style="color:#E67E22;text-decoration:none;">TestFlight</a> installed first).</p>'
    + '<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">'
    + '<tr><td align="center" style="border-radius:12px;background:#E67E22;">'
    + '<a href="https://testflight.apple.com/join/SRWqftSs" target="_blank" '
    + 'style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:12px;">'
    + 'Download on TestFlight</a>'
    + '</td></tr></table>'
    + '</td></tr>'

    // Sign-off
    + '<tr><td style="padding:24px 40px 40px;">'
    + '<p style="color:#555;font-size:14px;line-height:1.6;margin:0;">'
    + 'No spam. No dark patterns. Just good vibes and questionable confidence.</p>'
    + '<p style="color:#555;font-size:14px;line-height:1.6;margin:8px 0 0;">'
    + 'Questions? Just reply to this email.</p>'
    + '</td></tr>'

    // Footer
    + '<tr><td style="padding:20px 40px;border-top:1px solid rgba(0,0,0,0.06);text-align:center;">'
    + '<p style="color:#999;font-size:12px;margin:0;">\u00A9 ' + new Date().getFullYear() + ' 98% Chimp Inc.</p>'
    + '<a href="https://www.98chimp.ca/DKDerby/" style="color:#E67E22;font-size:12px;text-decoration:none;">www.98chimp.ca/DKDerby</a>'
    + '</td></tr>'

    + '</table></td></tr></table></body></html>';

  var plainBody = greeting + '\n\n'
    + 'You\'re on the early access list for Dunning-Kruger Derby. '
    + 'We\'ll notify you the moment it\'s ready. Prepare to be humbled.\n\n'
    + 'You signed up as: ' + joiningLabel + '\n\n'
    + 'GET THE BETA\n'
    + 'DK Derby is available now on TestFlight. Tap the link below to join the beta '
    + '(you\'ll need TestFlight installed first).\n\n'
    + 'Download on TestFlight: https://testflight.apple.com/join/SRWqftSs\n\n'
    + 'No spam. No dark patterns. Just good vibes and questionable confidence.\n'
    + 'Questions? Just reply to this email.\n\n'
    + '— The DK Derby Team\n'
    + 'www.98chimp.ca/DKDerby';

  GmailApp.sendEmail(email, subject, plainBody, {
    htmlBody: htmlBody,
    from: 'hello@98chimp.com',
    name: 'DK Derby'
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

// ── Test functions ─────────────────────────────────
function test98ChimpConfirmation() {
  send98ChimpConfirmation('Test User', 'shahinz@mac.com', ['brainfit', 'podcast']);
}

function testDKDerbyConfirmation() {
  sendDKDerbyConfirmation('Test User', 'shahinz@mac.com', 'Just curious');
}
