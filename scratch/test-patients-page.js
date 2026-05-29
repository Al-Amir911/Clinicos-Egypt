const { chromium } = require('@playwright/test');

(async () => {
  console.log('============================================================');
  console.log('   ClinicOS - Verification: Patient Page Toast Lookup Bug   ');
  console.log('============================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Monitor logs
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning' || type === 'log') {
      console.log(`[PAGE ${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login');

    console.log('Switching to signup tab...');
    await page.click('button[role="tab"]:has-text("حساب جديد")');

    const timestamp = Date.now();
    const email = `test.doctor.${timestamp}@example.com`;
    console.log(`Creating new account: ${email}`);
    await page.fill('#clinicName', 'عيادة السلام التخصصية');
    await page.fill('#doctorName', 'د. عمر سليمان');
    await page.fill('#fullName', 'عمر سليمان');
    await page.fill('#reg-email', email);
    await page.fill('#reg-password', 'Pass12345!');

    console.log('Submitting registration...');
    await page.click('button[type="submit"]:has-text("إنشاء الحساب")');

    console.log('Waiting for redirection to the dashboard...');
    await page.waitForURL('http://localhost:3000/');
    await page.waitForSelector('text=طابور الانتظار');

    // Add a patient
    console.log('Adding a patient to seed data...');
    await page.click('button:has-text("إضافة مريض")');
    await page.waitForSelector('#phone');

    const phone = '01110203939';
    const name = 'عمر محمد الأمير';
    await page.type('#phone', phone);
    await page.fill('#name', name);
    await page.click('button[type="submit"]:has-text("تأكيد وإضافة للطابور")');

    await page.waitForSelector('text=تمت إضافة المريض للطابور بنجاح');
    console.log('Patient successfully added. Now going to Patient Directory...');

    // Navigate to patients page
    await page.goto('http://localhost:3000/patients');
    
    // Wait for the patient row to be visible
    console.log('Waiting for patients list to load...');
    await page.waitForSelector(`text=${name}`);
    console.log(`Found patient "${name}" in directory.`);

    // Wait 5 seconds and monitor toasts
    console.log('Waiting 5 seconds to ensure no lookup toasts trigger...');
    await page.waitForTimeout(5000);

    const isToastVisible = await page.isVisible('text=تم العثور على اسم المريض مسجلاً مسبقاً');
    if (isToastVisible) {
      throw new Error('BUG DETECTED: Toast notification "تم العثور على اسم المريض مسجلاً مسبقاً" was triggered on patients page!');
    } else {
      console.log('SUCCESS: No unexpected lookup toasts triggered on patients page! ✅');
    }

  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    process.exit(1);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
})();
